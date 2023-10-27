#!/usr/bin/env sh
"\"",`$(echo --% ' |out-null)" >$null;function :{};function dv{<#${/*'>/dev/null )` 2>/dev/null;dv() { #>
echo "1.36.1"; : --% ' |out-null <#'; }; version="$(dv)"; deno="$HOME/.deno/$version/bin/deno"; if [ -x "$deno" ]; then  exec "$deno" run -q -A "$0" "$@";  elif [ -f "$deno" ]; then  chmod +x "$deno" && exec "$deno" run -q -A "$0" "$@";  fi; bin_dir="$HOME/.deno/$version/bin"; exe="$bin_dir/deno"; has () { command -v "$1" >/dev/null; } ;  if ! has unzip; then if ! has apt-get; then  has brew && brew install unzip; else  if [ "$(whoami)" = "root" ]; then  apt-get install unzip -y; elif has sudo; then  echo "Can I install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  sudo apt-get install unzip -y; fi; elif has doas; then  echo "Can I install unzip for you? (its required for this command to work) ";read ANSWER;echo;  if [ "$ANSWER" =~ ^[Yy] ]; then  doas apt-get install unzip -y; fi; fi;  fi;  fi;  if ! has unzip; then  echo ""; echo "So I couldn't find an 'unzip' command"; echo "And I tried to auto install it, but it seems that failed"; echo "(This script needs unzip and either curl or wget)"; echo "Please install the unzip command manually then re-run this script"; exit 1;  fi;  repo="denoland/deno"; if [ "$OS" = "Windows_NT" ]; then target="x86_64-pc-windows-msvc"; else :;  case $(uname -sm) in "Darwin x86_64") target="x86_64-apple-darwin" ;; "Darwin arm64") target="aarch64-apple-darwin" ;; "Linux aarch64") repo="LukeChannings/deno-arm64" target="linux-arm64" ;; "Linux armhf") echo "deno sadly doesn't support 32-bit ARM. Please check your hardware and possibly install a 64-bit operating system." exit 1 ;; *) target="x86_64-unknown-linux-gnu" ;; esac; fi; deno_uri="https://github.com/$repo/releases/download/v$version/deno-$target.zip"; exe="$bin_dir/deno"; if [ ! -d "$bin_dir" ]; then mkdir -p "$bin_dir"; fi;  if ! curl --fail --location --progress-bar --output "$exe.zip" "$deno_uri"; then if ! wget --output-document="$exe.zip" "$deno_uri"; then echo "Howdy! I looked for the 'curl' and for 'wget' commands but I didn't see either of them. Please install one of them, otherwise I have no way to install the missing deno version needed to run this code"; exit 1; fi; fi; unzip -d "$bin_dir" -o "$exe.zip"; chmod +x "$exe"; rm "$exe.zip"; exec "$deno" run -q -A "$0" "$@"; #>}; $DenoInstall = "${HOME}/.deno/$(dv)"; $BinDir = "$DenoInstall/bin"; $DenoExe = "$BinDir/deno.exe"; if (-not(Test-Path -Path "$DenoExe" -PathType Leaf)) { $DenoZip = "$BinDir/deno.zip"; $DenoUri = "https://github.com/denoland/deno/releases/download/v$(dv)/deno-x86_64-pc-windows-msvc.zip";  [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12;  if (!(Test-Path $BinDir)) { New-Item $BinDir -ItemType Directory | Out-Null; };  Function Test-CommandExists { Param ($command); $oldPreference = $ErrorActionPreference; $ErrorActionPreference = "stop"; try {if(Get-Command "$command"){RETURN $true}} Catch {Write-Host "$command does not exist"; RETURN $false}; Finally {$ErrorActionPreference=$oldPreference}; };  if (Test-CommandExists curl) { curl -Lo $DenoZip $DenoUri; } else { curl.exe -Lo $DenoZip $DenoUri; };  if (Test-CommandExists curl) { tar xf $DenoZip -C $BinDir; } else { tar -Lo $DenoZip $DenoUri; };  Remove-Item $DenoZip;  $User = [EnvironmentVariableTarget]::User; $Path = [Environment]::GetEnvironmentVariable('Path', $User); if (!(";$Path;".ToLower() -like "*;$BinDir;*".ToLower())) { [Environment]::SetEnvironmentVariable('Path', "$Path;$BinDir", $User); $Env:Path += ";$BinDir"; } }; & "$DenoExe" run -q -A "$PSCommandPath" @args; Exit $LastExitCode; <# 
# */0}`;
import { autoRenameVars, removeComments } from "https://raw.githubusercontent.com/jeff-hykin/code_unifier/bc9a70cc4ce8e71f38591a1c96e4fc22da20f50f/languages/python.js"
import { FileSystem, glob } from "https://deno.land/x/quickr@0.6.47/main/file_system.js"
import { run, throwIfFails, zipInto, mergeInto, returnAsString, Timeout, Env, Cwd, Stdin, Stdout, Stderr, Out, Overwrite, AppendTo } from "https://deno.land/x/quickr@0.6.47/main/run.js"
import { zip, enumerate, count, permute, combinations, wrapAroundGet } from "https://deno.land/x/good@1.5.0.2/array.js"
import { parseCsv, createCsv } from "https://deno.land/x/good@1.5.0.2/csv.js"
import { stats, sum, spread, normalizeZeroToOne, roundedUpToNearest, roundedDownToNearest } from "https://deno.land/x/good@1.5.0.2/math.js"


import * as diff from "https://esm.sh/diff@5.1.0"

const format = async (code)=>{
    return await run`black -c ${code} ${Stdout(returnAsString)}`
}

const standardize = async (code)=>{
    const { newCode, stackManager, varSelections } = autoRenameVars({
        code: await format(removeComments({code})),
        useGloballyUniqueNames: false,
        nameGenerator: (id)=>`var_${id}`,
    })
    return newCode
}

async function compare(filePaths) {
    const fileContents = await Promise.all(
        filePaths.map(
            eachPath=>
                FileSystem.read(eachPath).then(async content=>{
                    content = await standardize(content)
                    const [ folders, itemName, itemExtensionWithDot ] = FileSystem.pathPieces(eachPath)
                    FileSystem.write({data: content, path: `${folders.join("/")}/${itemName}.standardized${itemExtensionWithDot}`})
                    return content
                })
        )
    )
    const rows = []
    const scores = []
    for (const [eachFilePath, eachFileContents] of zip(filePaths, fileContents)) {
        for (const [eachOtherFilePath, eachOtherFileContents] of zip(filePaths, fileContents)) {
            if (eachFilePath != eachOtherFilePath) {
                const differences = diff.diffLines(eachFileContents, eachOtherFileContents)
                // for (let each of differences) {
                //     console.debug(`-`)
                //     console.debug(`    each.added is:`,each.added)
                //     console.debug(`    each.removed is:`,each.added)
                //     console.debug(`    each is:`,each)
                // }
                const maxNumberOfLines = Math.max(eachFileContents.split('\n').length, eachOtherFileContents.split('\n').length)
                const similarity = 1 - (differences.filter(part=>part.added||part.removed).length / maxNumberOfLines)
                rows.push([ eachFilePath, eachOtherFilePath, similarity ])
                scores.push(similarity)
            }
        }
    }
    
    return await createCsv({
        separator: "\t",
        comments: [],
        columnNames: [ "file1", "file2", "common_line_proportion" ],
        rows,
    })
}

import { parse } from "https://deno.land/std@0.168.0/flags/mod.ts"
const flags = parse(Deno.args, {
    boolean: ["help", "color"],
    string: ["version"],
    default: { color: true },
})


console.log(
    await compare(flags._)
)
// (this comment is part of deno-guillotine, dont remove) #>