import { default as _ } from "https://esm.sh/lodash@4.17.21"
import { default as random } from "https://esm.sh/random"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.1.0/math.js"
import { zip } from "https://deno.land/x/good@1.5.1.0/array.js"
import ProgressBar from "https://deno.land/x/progress@v1.3.8/mod.ts"

export const similarity = async function({documents, defaultChunkSize=40, checkRate=100, commonalityIgnoreThreshold=0.4, topX=5, lookbackSize=10, stabilityThreshold=0.95 }) {
    const progress = new ProgressBar({
        title: "stablized entries:",
        total: Object.keys(documents).length,
    })
    progress.render(0)
    const miscHyperparameter = 4
    // chunk exists in lots of documents = chunk too small
    // chunk exists in only 1 document = chunk too big
    let chunkSize = defaultChunkSize
    const frequencyMatrix = {}
    const documentNames = Object.keys(documents)
    const documentList = Object.values(documents)
    for (const documentName of documentNames) {
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
        const approxProportionComplete = (Math.pow((doneThreshold - average)+1, 12) / Math.pow(doneThreshold + 1, 12))
        const spreadValue = approxProportionComplete * documentNames.length
        smoothedPrintoutValue.push(spreadValue)
        progress.render(Math.round(stats(smoothedPrintoutValue.slice(-((1-approxProportionComplete)*100),)).average))
        if (numberOfStable >= doneThreshold) {
            progress.render(documentNames.length) // e.g. 100%
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
            }
            const localChunkSize = Math.round(random.normal(chunkSize, chunkSize/miscHyperparameter)())
            
            const randomChunk = escapeRegexMatch(randomDoc.slice(_.random(0, randomDoc.length-localChunkSize-1), localChunkSize))

            const trueFalseMap = {}
            for (const [otherDocName, otherDoc] of Object.entries(documents)) {
                trueFalseMap[otherDocName] = !!otherDoc.match(randomChunk)
            }
            const commonalityCount = sum(Object.values(trueFalseMap))
            commonalityCounts[commonalityCount] = (commonalityCounts[commonalityCount]+1)||1
            // so common that effectly every document contains the chunk
            if (commonalityCount > documentNames.length*commonalityIgnoreThreshold) {
                chunkSize += 1
            } else {
                
                if (commonalityCount == 1) {
                    chunkSize = chunkSize/2
                } else {
                    for (const [key, value] of Object.entries(trueFalseMap)) {
                        if (value) {
                            // self
                            if (key == randomDocName) {
                                frequencyMatrix[randomDocName][key] += 1
                            } else {
                                frequencyMatrix[randomDocName][key] += 1
                                frequencyMatrix[key][randomDocName] += 1
                                frequencyMatrix[key][key] += 1
                            }
                        }
                    }
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
