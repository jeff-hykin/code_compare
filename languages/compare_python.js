import { autoRenameVars, removeComments, parser } from "https://raw.githubusercontent.com/jeff-hykin/code_unifier/bc9a70cc4ce8e71f38591a1c96e4fc22da20f50f/languages/python.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://deno.land/x/good@1.5.0.2/array.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.0.2/math.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"
import { StackManager, replaceSequence, parseTreeAsHtmlLikeString } from "https://raw.githubusercontent.com/jeff-hykin/code_unifier/bc9a70cc4ce8e71f38591a1c96e4fc22da20f50f/tooling.js"
import $ from "https://esm.sh/@jsr/david__dax@0.43.0/mod.ts"
const $$ = (...args)=>$(...args).noThrow()

const toAst = (code) => {
    const tree = parser.parse(code)
    const outputs = []
    let indent = ""
    for (const [ parents, node, direction ] of tree.rootNode.traverse()) {
        const isLeafNode = direction == "-"
        if (isLeafNode) {
            if (node.type == "integer") {
                outputs.push(`${indent}<${node.type} text=${JSON.stringify(node.text)} />`)
            } else if (node.type == "float") {
                outputs.push(`${indent}<${node.type} text=${JSON.stringify(node.text)} />`)
            } else {
                outputs.push(`${indent}<${node.type} />`)
            }
        } if (direction == "->") {
            outputs.push(`${indent}<${node.type}>`)
            indent += "    "
        } else if (direction == "<-") {
            indent = indent.slice(0,-4)
            outputs.push(`${indent}</${node.type}>`)
        }
    }
    return outputs.join("\n")
}

const format = async (code)=>{
    return await $$`black --line-length 1 --skip-magic-trailing-comma -c ${code}`.timeout("5s").text("stdout")
}

export const stages = {
    removeComments: (code, args, source)=>removeComments({code}),
    format,
    autoRenameVars: (code, args, source)=>(
        autoRenameVars({
            code,
            useGloballyUniqueNames: false,
            nameGenerator: (id)=>`var_${id}`,
        }).newCode
    ),
    toAst,
}