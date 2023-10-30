import { default as _ } from "https://esm.sh/lodash@4.17.21"
import { default as random } from "https://esm.sh/random"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.1.0/math.js"
import { zip } from "https://deno.land/x/good@1.5.1.0/array.js"
import ProgressBar from "https://deno.land/x/progress@v1.3.8/mod.ts"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.48/main/file_system.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo } from "https://deno.land/x/quickr@0.6.49/main/run.js"

export const similarity = async function({documents, defaultChunkSize=12, checkRate=100, commonalityIgnoreThreshold=1, topX=5, lookbackSize=10, stabilityThreshold=0.95, minChunkPerDocCount=null, }) {
    const documentNames = Object.keys(documents)
    if (minChunkPerDocCount == null && documentNames.length < 30) {
        minChunkPerDocCount = 5000
    } else if (minChunkPerDocCount == null && documentNames.length < 60) {
        minChunkPerDocCount = 500
    } else if (minChunkPerDocCount == null && documentNames.length < 200) {
        minChunkPerDocCount = 100
    } else {
        minChunkPerDocCount = 50
    }
    const progress = new ProgressBar({
        title: "stablizing entries:",
        total: documentNames.length  * (minChunkPerDocCount+1) ,
    })
    progress.render(0)
    const miscHyperparameter = 4
    // chunk exists in lots of documents = chunk too small
    // chunk exists in only 1 document = chunk too big
    let chunkSize = defaultChunkSize
    const frequencyMatrix = {}
    // const chunkTracker = {}
    
    const documentList = Object.values(documents)
    for (const documentName of documentNames) {
        // chunkTracker[documentName] = []
        frequencyMatrix[documentName] = {}
        for (const otherDocumentName of documentNames) {
            frequencyMatrix[documentName][otherDocumentName] = 0
        }
    }
    
    const computeRelativeCounts = (frequencyMatrix)=>{
        const relativeCounts = {}
        const medians = {}
        for (const documentName of documentNames) {
            relativeCounts[documentName] = {}
            const relativeScores = normalizeZeroToOne(Object.values(frequencyMatrix[documentName]))
            for (const [otherDocumentName, score] of zip(documentNames, relativeScores)) {
                relativeCounts[documentName][otherDocumentName] = score * 100
            }
            relativeCounts[documentName] = Object.fromEntries(Object.entries(relativeCounts[documentName]).sort((a,b)=>b[1]-a[1]))
        }
        return relativeCounts
    }

    let prevMatrix = {}
    let prevRankings = {}
    let unstableCountHistory = []
    let smoothedPrintoutValue = []
    const doneThreshold =  stabilityThreshold * documentNames.length
    const rankingsChangedForTopX = (relativeCounts)=>{
        let chunkInitCount = 0
        for (const [key, value] of Object.entries(frequencyMatrix)) {
            chunkInitCount += Math.min(frequencyMatrix[key][key], minChunkPerDocCount)
        }
        if (chunkInitCount < (documentNames.length * minChunkPerDocCount)) {
            progress.render(chunkInitCount)
            return true
        }

        if (JSON.stringify(prevMatrix) == JSON.stringify(frequencyMatrix)) {
            prevMatrix = JSON.parse(JSON.stringify(frequencyMatrix) )
            return true
        }
        prevMatrix = JSON.parse(JSON.stringify(frequencyMatrix) )

        const topXMapping = {}
        let unstableCount = 0
        for (const [mainDocument, value] of Object.entries(relativeCounts)) {
            topXMapping[mainDocument] = Object.keys(value).slice(0, topX)
            if (JSON.stringify(topXMapping[mainDocument]) != JSON.stringify(prevRankings[mainDocument])) {
                unstableCount += 1
            }
        }
        prevRankings = topXMapping
        unstableCountHistory.push(unstableCount)
        if (unstableCountHistory.length < topX) {
            return true
        }
        unstableCountHistory = unstableCountHistory.slice(-lookbackSize)
        const average = stats(unstableCountHistory).average
        const numberOfStable = documentNames.length - average
        const approxProportionComplete = (documentNames.length - average)/documentNames.length
        const spreadValue = approxProportionComplete * documentNames.length
        smoothedPrintoutValue.push(spreadValue)
        smoothedPrintoutValue = smoothedPrintoutValue.slice(-100,)
        var value = Math.round(stats(smoothedPrintoutValue.slice(-((1-approxProportionComplete)*100),)).average)
        progress.render( chunkInitCount + value)
        if (numberOfStable >= doneThreshold) {
            value = chunkInitCount + documentNames.length
            progress.render(value) // e.g. 100%
            return false
        } else {
            return true
        }
    }
    let iterationCount = 0
    const commonalityCounts = {}
    outer_loop: while (true) {
        for (const [randomDocName, randomDoc] of Object.entries(documents)) {
            const relativeCounts = computeRelativeCounts(frequencyMatrix) 
            iterationCount+=1
            if (iterationCount%checkRate === 0) {
                if (!rankingsChangedForTopX(relativeCounts)) {
                    // sort the matrix
                    for (const [documentName, value] of Object.entries(frequencyMatrix)) {
                        frequencyMatrix[documentName] = Object.fromEntries(Object.entries(frequencyMatrix[documentName]).sort((a,b)=>b[1]-a[1]))
                    }
                    // converged
                    return { relativeCounts, frequencyMatrix, chunkSize, commonalityCounts,  }
                }
                // Deno.writeTextFileSync("stats.json", JSON.stringify({chunkSize, commonalityCounts, relativeCounts, frequencyMatrix},0,4))
                // Deno.writeTextFileSync("chunks.json", JSON.stringify(chunkTracker,0,4))
            }
            const localChunkSize = Math.round(random.normal(chunkSize, chunkSize/miscHyperparameter)())
            
            const randomIndex = _.random(0, randomDoc.length-localChunkSize-1)
            const randomChunk = escapeRegexMatch(randomDoc.slice(randomIndex, randomIndex+localChunkSize))

            const trueFalseMap = {}
            for (const [otherDocName, otherDoc] of Object.entries(documents)) {
                trueFalseMap[otherDocName] = !!otherDoc.match(randomChunk)
                // if (trueFalseMap[otherDocName]) {
                    // chunkTracker[otherDocName].push(randomChunk)
                // }
            }
            const commonalityCount = sum(Object.values(trueFalseMap))
            commonalityCounts[commonalityCount] = (commonalityCounts[commonalityCount]+1)||1
            // so common that effectly every document contains the chunk
            if (commonalityCount > documentNames.length*commonalityIgnoreThreshold) {
                chunkSize += 1
            } else {
                for (const [key, value] of Object.entries(trueFalseMap)) {
                    if (value) {
                        frequencyMatrix[randomDocName][key] += 1
                        frequencyMatrix[key][randomDocName] += 1
                    }
                }
                
                if (commonalityCount == 1) {
                    chunkSize = chunkSize/2
                } else {
                    chunkSize += 1
                }
            }
        }
    }
}

export function removeCommonSuffix(listOfStrings) {
    return removeCommonPrefix(
        listOfStrings.map(each=>[...each].reverse().join(""))
    ).map(
        each=>[...each].reverse().join("")
    )
}

export function getStandardizedName(path) {
    const [ folders, itemName, itemExtensionWithDot ] = FileSystem.pathPieces(path)
    return `${folders.join("/")}/${itemName}.standardized${itemExtensionWithDot}`
}

export const runComparison = async ({ certainty, stageArgs, stages, filePaths })=> {
    if (stages.length != 0) {
        console.log(`standardizing:`)
    }
    const fileContents = await Promise.all(
        filePaths.filter(each=>{
            // skip files that are ".standardized"
            const [ folders, itemName, itemExtensionWithDot ] = FileSystem.pathPieces(each)
            return !itemName.endsWith(`.standardized`)
        }).map(
            eachPath=>
                FileSystem.read(eachPath).then(async content=>{
                    if (!content) {
                        throw Error(`problem reading: ${eachPath}`)
                    }
                    for (const each of stages) {
                        content = await each(content, stageArgs)
                        if (content == null) {
                            console.debug(`stage is:`,stage)
                        }
                    }
                    if (stages.length != 0) {
                        const path = getStandardizedName(eachPath)
                        console.log(`    creating: ${path}`)
                        await FileSystem.write({data: content, path})
                    }
                    return content
                })
        )
    )
    const names = removeCommonSuffix(removeCommonPrefix(filePaths))
    const nameToFullPath = Object.fromEntries(zip(names, filePaths))
    const documents = Object.fromEntries(zip(removeCommonSuffix(removeCommonPrefix(filePaths)), fileContents))
    return {
        ...await similarity({
            documents,
            stabilityThreshold: certainty/100
        }),
        nameToFullPath,
    }
}