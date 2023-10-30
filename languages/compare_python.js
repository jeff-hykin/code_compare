import { autoRenameVars, removeComments } from "https://raw.githubusercontent.com/jeff-hykin/code_unifier/bc9a70cc4ce8e71f38591a1c96e4fc22da20f50f/languages/python.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://deno.land/x/good@1.5.0.2/array.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.0.2/math.js"
import { capitalize, indent, toCamelCase, digitsToEnglishArray, toPascalCase, toKebabCase, toSnakeCase, toScreamingtoKebabCase, toScreamingtoSnakeCase, toRepresentation, toString, regex, findAll, iterativelyFindAll, escapeRegexMatch, escapeRegexReplace, extractFirst, isValidIdentifier, removeCommonPrefix } from "https://deno.land/x/good@1.5.1.0/string.js"
import { run, hasCommand, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo } from "https://deno.land/x/quickr@0.6.49/main/run.js"

const format = async (code)=>{
    return await run`black -c ${code} ${Stdout(returnAsString)}`
}

export const stages = {
    removeComments: (code)=>removeComments({code}),
    format,
    autoRenameVars: (code)=>(
        autoRenameVars({
            code,
            useGloballyUniqueNames: false,
            nameGenerator: (id)=>`var_${id}`,
        }).newCode
    ),
}