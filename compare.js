console.log(`loading files`)
import { compare, compare as comparePython } from "./languages/compare_python.js"
import { parse } from "https://deno.land/std@0.168.0/flags/mod.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.48/main/file_system.js"
import { parseCsv, createCsv } from "https://deno.land/x/good@1.5.0.3/csv.js" 
import { zip } from "https://deno.land/x/good@1.5.1.0/array.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"
import { histogramHtmlBytes } from "./plotting/tools.js"

// TODO:
    // get a better similarity metric

    // trailing whitespace matches
    // remove/ignore string content
    // add modified-line similarity
    // add before-formatting matches
    // add before-standardization matches
    // super-common-lines ignore threshold



const flags = parse(Deno.args, {
    boolean: ["help", ],
    string: ["lang", "output", "lookbackSize"],
    default: {
        lang: null,
        output: "comparison",
        certainty: 10,
    },
})

async function summarizer(rows, scores) {
    const names = removeCommonPrefix(flags._)
    const indexOfBaseFile  = 0
    const indexOfOtherFile = 1
    const indexOfScore     = 2
    
    const filePathToName = Object.fromEntries(zip(flags._, names))
    
    // shorten up the path names
    rows = rows.map(each=>([
        filePathToName[each[indexOfBaseFile]],
        filePathToName[each[indexOfOtherFile]],
        each[indexOfScore],
    ]))
    
    const fileGroups = {}
    for (const [fileGroup, ...otherData] of rows) {
        fileGroups[fileGroup] = fileGroups[fileGroup]||[]
        fileGroups[fileGroup].push(otherData)
    }
    const summaryData = []
    const localScoreIndex = 1
    for (const [key, value] of Object.entries(fileGroups)) {
        value.sort((a,b)=>b[localScoreIndex]-a[localScoreIndex])
        summaryData.push([key, ...value[0]])
    }
    summaryData.sort((a,b)=>b[indexOfScore]-a[indexOfScore])
    
    console.log(`saving outputs to: ${flags.output}/`)
    await Promise.all([
        FileSystem.write({
            path: `${flags.output}/all_comparisions.tsv`,
            data: createCsv({
                columnNames: ["base", "other", "score"],
                rows: rows,
                separator: "\t",
                alignColumns: true,
            }),
        }),
        FileSystem.write({
            path: `${flags.output}/summary_of_most_similar.tsv`,
            data: createCsv({
                columnNames: ["base", "other", "score"],
                rows: summaryData,
                separator: "\t",
                alignColumns: true,
            }),
        }),
        FileSystem.write({
            path: `${flags.output}/summary_of_most_similar.histogram.html`,
            data: histogramHtmlBytes({
                dataframe: {
                    x: summaryData.map(each=>each[indexOfScore]),
                },
                valueColumnName: "x",
            }),
        }),
        FileSystem.write({
            path: `${flags.output}/all.histogram.html`,
            data: histogramHtmlBytes({
                dataframe: {
                    x: rows.map(each=>each[indexOfScore]),
                    who: rows.map(each=>each[indexOfBaseFile]),
                },
                valueColumnName: "x",
                groupColumnName: "who",
                binMultiplier: 2,
                opacity: 0.5,
            }),
        }),
        ...Object.entries(fileGroups).map(async ([groupName, rows])=>{
            const individualPath = `${flags.output}/individuals/${groupName}/`
            await FileSystem.ensureIsFolder(individualPath)
            return FileSystem.write({
                path: `${individualPath}/comparisions.tsv`,
                data: createCsv({
                    columnNames: ["other", "score"],
                    rows: rows,
                    separator: "\t",
                    alignColumns: true,
                }),
            })
        })
    ])
}
 
if (flags.lang == "python") {
    const ensureFolder = FileSystem.ensureIsFolder(flags.output)
    const { relativeCounts, frequencyMatrix, chunkSize, commonalityCounts, } = await comparePython(flags._, flags.certainty)
    const path =`${flags.output}/details.json`
    await FileSystem.write({
        path,
        data: JSON.stringify({ relativeCounts, frequencyMatrix, commonalityCounts, },0,4),
    })
    console.log(`\ndata saved to: ${path}`)
    // const { rows, scores } = await comparePython(flags._)
    // await summarizer(rows, scores)
} else if (flags.lang == null) {
    console.log(`Please include a --lang argument (currently python is the only supported language)\ncode_compare --lang python file1 file2`)
} else {
    console.log(`Sorry --lang python is the only one supported at the moment (${JSON.stringify(flags.lang)} is not supported)`)
}