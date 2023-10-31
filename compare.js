console.log(`loading files`)
import { parse } from "https://deno.land/std@0.168.0/flags/mod.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.48/main/file_system.js"
import { Console, red, green, yellow } from "https://deno.land/x/quickr@0.6.48/main/console.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo } from "https://deno.land/x/quickr@0.6.49/main/run.js"
import { parseCsv, createCsv } from "https://deno.land/x/good@1.5.0.3/csv.js" 
import { zip } from "https://deno.land/x/good@1.5.1.0/array.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix, didYouMean } from "https://deno.land/x/good@1.5.1.0/string.js"
import { histogramHtmlBytes } from "./plotting/tools.js"

import * as yaml from "https://deno.land/std@0.168.0/encoding/yaml.ts"
import { runComparison, getStandardizedName } from "./tools.js"

// TODO:
    // optional stage for removing string content

const flags = parse(Deno.args, {
    boolean: ["help", ],
    string: [ "inspect", "lang", "output", "lookbackSize", "stages", "stageArguments", "preferencesPath"],
    default: {
        inspect: null,
        lang: null,
        output: "comparison",
        certainty: 10,
        stages: null,
        stageArguments: null,
        preferencesPath: `${FileSystem.home}/.config/code_compare/preferences.json`,
    },
})

async function interactiveAnalysis(path) {
    const text = await FileSystem.read(path)
    if (!text) {
        throw Error(`\n\nI don't see that file (or the file is empty): ${JSON.stringify(path)}\n`)
    }
    let data
    try {
        data = yaml.parse(text)
    } catch (error) {
        throw Error(`\n\n${JSON.stringify(path)} doesnt seem to be valid as a JSON file\n`)
    }

    if (!(data.relativeCounts instanceof Object)) {
        throw Error(`I looked at "relativeCounts" in ${JSON.stringify(path)} but I didn't see a valid value for it`)
    }

    let {relativeCounts, nameToFullPath} = data

    const documentNames = Object.keys(relativeCounts)
    // sort within each basefile
    for (const documentName of documentNames) {
        relativeCounts[documentName] = Object.fromEntries(Object.entries(relativeCounts[documentName]).sort((a,b)=>b[1]-a[1]))
    }
    // sort basefiles by max similarity
    relativeCounts = Object.fromEntries(Object.entries(relativeCounts).sort(([aKey,aValue],[bKey,bValue])=>{
        // (first highest is itself, which is always 100)
        const secondHighestSimilarityForB = Object.values(bValue)[1]
        const secondHighestSimilarityForA = Object.values(aValue)[1]
        return secondHighestSimilarityForB - secondHighestSimilarityForA
    }))


    let preferences = {}
    try {
        preferences = yaml.parse(await FileSystem.read(flags.preferencesPath))
        console.log(`\nloaded your preferences from: ${JSON.stringify(flags.preferencesPath)}`)
        // artificial wait so they can see the message
        await new Promise((resolve, reject) => setTimeout(resolve, 1000))
    } catch (error) {
        
    }

    if (!preferences.diffCommand) {
        if (await hasCommand("code")) {
            console.log(``)
            if (await Console.askFor.yesNo(`Should I use VS Code for diffing?`)) {
                preferences.diffCommand = ["code", "--wait", "--diff", "FILE1", "FILE2"]
                console.log(`Cool, I'll save your answer to ${JSON.stringify(flags.preferencesPath)} so I dont have to ask every time`)
                await FileSystem.write({
                    path: flags.preferencesPath,
                    data: JSON.stringify(preferences,0,4)
                })
            }
        }
    }
    const diffLineConvert = (diffCommand, file1, file2)=>{
        if (diffCommand instanceof Array) {
            diffCommand = JSON.stringify(diffCommand)
        }
        return yaml.parse(
            diffCommand.replace(/FILE1/, JSON.stringify(file1).slice(1,-1)).replace(/FILE2/, JSON.stringify(file2).slice(1,-1))
        )
    }
    while (!preferences.diffCommand) {
        const line = await Console.askFor.line(`\nWhat argument list should I use to diff two files?\nFor example to use your default git-diff tool the command is:\n    git difftool --no-index -- FILE1 FILE2\nSo and the argument list of that command is:\n    ["git","difftool","--no-index","--","FILE1","FILE2"]\n\n`)
        // emacs --eval '(ediff-files "file1" "file2")'
        try {
            const argList = yaml.parse(line)
            if (!(argList instanceof Array)) {
                throw Error(`Not an array: ${argList}`)
            }
        } catch (error) {
            console.log(`looks like that wasn't a valid JSON list\nI got this error: ${error.message}\nPlease try again`)
            continue
        }
        Console.askFor.confirmation(`okay let me test it out real quick`) 
        try {
            const argList = diffLineConvert(line, FileSystem.thisFile, `${FileSystem.thisFolder}/tools.js`)
            var { success, } = await run(argList)
        } catch (error) {
            
        }
        if (success) {
            if (await Console.askFor.yesNo(`Did that work? (some popup showing some kind of file diff)`)) {
                console.log(`Okay, saving it to ${JSON.stringify(flag.preferencesPath)}`)
                preferences.diffCommand = yaml.parse(line)
                await FileSystem.write({
                    path: flag.preferencesPath,
                    data: JSON.stringify(preferences,0,4)
                })
                break
            }
        } else {
            console.log(`\nLooks like that ended with an error :/`)
        }

        if (line.match(/\bgit\b/)) {
            console.log(`NOTE: you might not have a git diff tool setup yet`)
            console.log(`As a fallback you can always use git's bultin diff tool with this response:`)
            console.log(`     ["git","diff","--no-index","--","FILE1","FILE2"]`)
            console.log(`However, you can also check what external tool is configured with:`)
            console.log(`    git config diff.tool`)
            let output = ""
            try {
                output = (await run(["git", "config", "diff.tool", ], Stdout(returnAsString))).trim()
            } catch (error) {
                
            }
            console.log(`The current output of ^that is: ${JSON.stringify(output)}`)
            console.log(`Here's an example of setting a git-config preference to vscode`)
            console.log(`    git config diff.tool vscode`)
            console.log(`    git config difftool.vscode.cmd 'code --wait --diff $LOCAL $REMOTE'`)
            console.log(``)
        }
        
        if (await Console.askFor.yesNo(`Would you like to try again?`)) {
            continue
        } else {
            if (await Console.askFor.yesNo(`\nDo you want to save the broken diff command anyways?`)) {
                console.log(`Okay, saving it to ${JSON.stringify(flag.preferencesPath)}`)
                preferences.diffCommand = yaml.parse(line)
                await FileSystem.write({
                    path: flag.preferencesPath,
                    data: JSON.stringify(preferences,0,4)
                })
                break
            } else {
                console.log(`Okay, well I'll let you try again then`)
                continue
            }
        }
    }
    const flaggedEntriesPath = `${FileSystem.parentPath(path)}/flagged_entries.tsv`
    let flaggedEntries = []
    try {
         var { comments, columnNames, rows } = parseCsv({
            input: await FileSystem.read(flaggedEntriesPath),
            separator: "\t",
            firstRowIsColumnNames: true,
        })
        flaggedEntries = rows.map(each=>`${each.baseName} <=> ${each.otherName}`)
    } catch (error) {
        
    }
    
    function showInstructions() {
        console.log(`Press "f" [Enter] to flag/unflag an entry`)
        console.log(`Press "o" [Enter] to diff original files (e.g. "open")`)
        console.log(`Press "i" [Enter] to diff standardized files (e.g. "inspect")`)
        console.log(`Press "n" [Enter] to go to the next comparision (same base file)`)
        console.log(`Press "p" [Enter] to go to the prev comparision (same base file)`)
        console.log(`Press     [Enter] to go to the next base file`)
        console.log(`Press "u" [Enter] to go to the prev base file`)
        console.log(``)
        console.log(`Note: flagged entries will be saved to: ${JSON.stringify(flaggedEntriesPath)}`)
    }
    
    console.log()
    console.log()
    showInstructions()
    console.log()
    let baseHistory = []
    let skipToBase = null
    let promises = []
    const toFlagKey = (docName, otherDocName)=>`${JSON.stringify(docName)} <=> ${JSON.stringify(otherDocName)}`
    
    full_restart_loop: while (1) {
        base_doc_loop: for (const [docName, otherDocs] of Object.entries(relativeCounts)) {
            baseHistory.push(docName)
            if (skipToBase != null) {
                if (skipToBase == docName) {
                    skipToBase = null
                } else {
                    continue
                }
            }
            let compareHistory = []
            let skipToCompare = null
            console.log(yellow.blackBackground`\nbase file: ${JSON.stringify(docName)}`)
            comparison_loop: for (const [otherDocName, value] of Object.entries(otherDocs)) {
                compareHistory.push(otherDocName)
                if (skipToCompare != null) {
                    if (skipToCompare == docName) {
                        skipToCompare = null
                    } else {
                        continue
                    }
                }
                if (docName == otherDocName) {
                    continue
                }
                console.log(``)
                let flagged = flaggedEntries.includes(toFlagKey(docName, otherDocName)) || flaggedEntries.includes(toFlagKey(otherDocName, docName))
                while (1) {
                    const nextLetter = await Console.askFor.line(green.blackBackground`    ${red.blackBackground`${flagged?"(flagged) ":""}`}similarity of ${value.toFixed(2)} with:${JSON.stringify(otherDocName)}: `)
                    if (nextLetter==""||nextLetter==null) {
                        // next base file
                        continue base_doc_loop
                    } else if (nextLetter == "n") {
                        continue comparison_loop
                    } else if (nextLetter == "p") {
                        skipToCompare = compareHistory[-2]
                        continue comparison_loop
                    } else if (nextLetter == "u") {
                        skipToBase = baseHistory[-2]
                    } else if (nextLetter == "f") {
                        // toggle 
                        if (flagged) {
                            console.log(`    un-flagged`)
                            flagged = false
                            const oneWay = toFlagKey(docName, otherDocName)
                            const theOther = toFlagKey(otherDocName, docName)
                            flaggedEntries = flaggedEntries.filter(each=>each!=oneWay||each!=theOther)
                        } else {
                            console.log(`    flagged`)
                            flagged = true
                            flaggedEntries.push(toFlagKey(docName, otherDocName))
                        }
                        try {
                            await FileSystem.write({
                                path: flaggedEntriesPath,
                                data: ["baseName", "otherName", "basePath", "otherPath", "compareCommand"].join("\t")+`\n`+flaggedEntries.map(each=>{
                                    const [first, second] = each.split(" <=> ")
                                    const docName = JSON.parse(first)
                                    const otherDocName = JSON.parse(second)
                                    const third = nameToFullPath[docName]
                                    const fourth = nameToFullPath[otherDocName]
                                    const fifth = `'${diffLineConvert(preferences.diffCommand, nameToFullPath[docName], nameToFullPath[otherDocName]).join("' '")}'`
                                    return [docName,otherDocName,third,fourth, fifth].map(JSON.stringify).join("\t")
                                }).join("\n"),
                            })
                            await FileSystem.write({
                                path: path,
                                data: JSON.stringify(
                                    {
                                        ...yaml.parse(await FileSystem.read(path)),
                                        flaggedEntries,
                                    },
                                    0,
                                    4,
                                ),
                            })
                        } catch (error) {
                            console.log(`error saving flags: ${error}`)
                        }
                    } else if (nextLetter == "o") {
                        try {
                            const command = diffLineConvert(preferences.diffCommand, nameToFullPath[docName], nameToFullPath[otherDocName])
                            console.log(`    running: '${command.join("' '")}'`)
                            run(command).catch(err=>null)
                            await run(["echo", "this is stupid but without it the previous run command isnt scheduled/run (because its async and not awaited)"], Stdout(null))
                        } catch (error) {
                            
                        }
                    } else if (nextLetter == "i") {
                        try {
                            const command = diffLineConvert(preferences.diffCommand, getStandardizedName(nameToFullPath[docName]), getStandardizedName(nameToFullPath[otherDocName]))
                            console.log(`    running: '${command.join("' '")}'`)
                            run(command).catch(err=>null)
                            await run(["echo", "this is stupid but without it the previous run command isnt scheduled/run (because its async and not awaited)"], Stdout(null))
                        } catch (error) {
                            
                        }
                    } else {
                        console.log(`I don't recognize that option\n`)
                        showInstructions()
                    }
                }
            }
        }
        console.log(`Done!`)
        Console.askFor.confirmation(`Would you like to restart at the top?`)
    }
    await Promise.all(promises)
}

async function cliCompareLogic(flags) {
    flags = {...flags}
    
    if (flags.stageArguments == null) {
        flags.stageArguments = {}
    } else if (typeof flags.stageArguments == 'string') {
        flags.stageArguments = JSON.stringify(flags.stageArguments)
    }

    if (flags.stages == null) {
        flags.stages = []
    }

    const ensureFolderPromise = FileSystem.ensureIsFolder(flags.output)
    
    const { relativeCounts, frequencyMatrix, chunkSize, commonalityCounts, nameToFullPath } = await runComparison(({
        certainty: flags.certainty,
        stageArgs: flags.stageArguments,
        stages: flags.stages,
        filePaths: flags._,
    }))
    
    const path =`${flags.output}/details.json`
    await ensureFolderPromise
    await FileSystem.write({
        path,
        data: JSON.stringify({ relativeCounts, frequencyMatrix, commonalityCounts, nameToFullPath },0,4),
    })
    console.log(`\nAnalysis Finished:`)
    console.log(`    data saved to: ${path}`)

    Console.askFor.confirmation(`\n\nWould you like to interactively compare files now?`)
    await interactiveAnalysis(path)
}

if (flags.inspect) {
    await interactiveAnalysis(flags.inspect)
    const text = await FileSystem.read(flags.inspect)
    if (!text) {
        throw Error(`\n\nI don't see that file (or the file is empty): ${JSON.stringify(flags.inspect)}\n`)
    }
    let data
    try {
        data = yaml.parse(text)
    } catch (error) {
        throw Error(`\n\n${JSON.stringify(flags.inspect)} doesnt seem to be valid as a JSON file\n`)
    }

    if (!(data.relativeCounts instanceof Object)) {
        throw Error(`I looked at "relativeCounts" in ${JSON.stringify(flags.inspect)} but I didn't see a valid value for it`)
    }
} else if (flags.lang == "python") {
    const { stages } = await import("./languages/compare_python.js")
    const stageNames = Object.keys(stages)
    if (flags.help) {
        console.log(`The available stages for python are:`)
        stageNames.map(each=>console.log(`    ${each}`))
        console.log(`The default value is ["removeComments","format","autoRenameVars"]`)
        console.log(`example usage:`)
        console.log(`   code_compare --lang python --stages '["format"]' -- file1.py file2.py`)
        Deno.exit(0)
    }
    if (flags.stages == null) {
        flags.stages = ["removeComments", "format", "autoRenameVars"]
    } else if (typeof flags.stages == 'string') {
        flags.stages = yaml.parse(flags.stages)
    }
    flags.stages.forEach(each=>didYouMean({ givenWord: each, possibleWords: stageNames, autoThrow: true, suggestionLimit: 1 })) 

    await cliCompareLogic({...flags, stages: flags.stages.map(each=>stages[each]) })

} else if (flags.lang == "none") {
    await cliCompareLogic({...flags, stages: [] })
} else if (flags.lang == null) {
    console.log(`Please include a --lang argument (currently "python" and "none" are the only options)\n    code_compare --lang python -- file1 file2`)
} else {
    console.log(`Sorry --lang python and --lang none are the only one supported at the moment (${JSON.stringify(flags.lang)} is not supported)`)
}