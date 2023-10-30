import { enumerate, count, permute, combinations, wrapAroundGet } from "https://deno.land/x/good@1.5.0.3/array.js"
import { zip } from "https://deno.land/x/good@1.5.0.3/iterable.js"
import { concatUint8Arrays } from "https://deno.land/x/binaryify@2.2.0.7/tools.js"

/**
 * Converts a list of objects into an object of lists where each attribute becomes a list.
 * For objects that don't have a specific attribute, the list contains `undefined` for those positions.
 *
 * @param {Array<Object>} listOfObjects - The list of objects to convert.
 * @returns {Object} An object of lists where each attribute becomes a list.
 *
 * @example
 * const listOfObjects = [
 *   { category: 'A', value: 1 },
 *   { category: 'B', value: 2, uniqueAttribute: 'X' },
 *   { category: 'A', value: 3 },
 *   { category: 'C', value: 4 },
 *   { category: 'B', value: 5 },
 * ];
 * const objectOfLists = convertListToObjectOfLists(listOfObjects);
 * // objectOfLists will be:
 * // {
 * //   category: [ "A", "B", "A", "C", "B" ],
 * //   value: [ 1, 2, 3, 4, 5 ],
 * //   uniqueAttribute: [ undefined, "X", undefined, undefined, undefined ]
 * // }
 */
function convertListToObjectOfLists(listOfObjects) {
    const attributes = {}
    for (const each of listOfObjects) {
        Object.assign(attributes, each)
    }
    const keys = Object.freeze(Object.keys(attributes))
    for (const eachKey of keys) {
        attributes[eachKey] = []
    }
    for (const eachEntry of listOfObjects) {
        for (const eachKey of keys) {
            attributes[eachKey].push(eachEntry[eachKey])
        }
    }
    return attributes
}


const defaultColors = ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"]
const histogramEndBytes = (new TextEncoder()).encode(")};</script></div></body></html>")
import uint8ArrayForHistogramHtml from "./histogram.html.binaryified.js"
let histogramTemplateString
export const histogramHtmlBytes = ({ dataframe, valueColumnName, groupColumnName, numberOfBins=null, opacity=0.8, colorOptions=defaultColors, width=1200, height=750, margin=60, responsive=true, binMultiplier=1, barmode="overlay", title, }) => {
    if (dataframe instanceof Array) {
        dataframe = convertListToObjectOfLists(dataframe)
    }

    const data = []
    const arg1 = {
        barmode,
        height,
        legend: {
            title: {
                text: title||groupColumnName||"",
            },
            tracegroupgap: 0,
        },
        margin: {
            t: margin,
        },
        template: {
            data: {
                barpolar: [
                    {
                        marker: {
                            line: {
                                color: "#E5ECF6",
                                width: 0.5,
                            },
                            pattern: {
                                fillmode: "overlay",
                                size: 10,
                                solidity: 0.2,
                            },
                        },
                        type: "barpolar",
                    },
                ],
                bar: [
                    {
                        error_x: {
                            color: "#2a3f5f",
                        },
                        error_y: {
                            color: "#2a3f5f",
                        },
                        marker: {
                            line: {
                                color: "#E5ECF6",
                                width: 0.5,
                            },
                            pattern: {
                                fillmode: "overlay",
                                size: 10,
                                solidity: 0.2,
                            },
                        },
                        type: "bar",
                    },
                ],
                carpet: [
                    {
                        aaxis: {
                            endlinecolor: "#2a3f5f",
                            gridcolor: "white",
                            linecolor: "white",
                            minorgridcolor: "white",
                            startlinecolor: "#2a3f5f",
                        },
                        baxis: {
                            endlinecolor: "#2a3f5f",
                            gridcolor: "white",
                            linecolor: "white",
                            minorgridcolor: "white",
                            startlinecolor: "#2a3f5f",
                        },
                        type: "carpet",
                    },
                ],
                choropleth: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        type: "choropleth",
                    },
                ],
                contourcarpet: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        type: "contourcarpet",
                    },
                ],
                contour: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "contour",
                    },
                ],
                heatmapgl: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "heatmapgl",
                    },
                ],
                heatmap: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "heatmap",
                    },
                ],
                histogram2dcontour: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "histogram2dcontour",
                    },
                ],
                histogram2d: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "histogram2d",
                    },
                ],
                histogram: [
                    {
                        marker: {
                            pattern: {
                                fillmode: "overlay",
                                size: 10,
                                solidity: 0.2,
                            },
                        },
                        type: "histogram",
                    },
                ],
                mesh3d: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        type: "mesh3d",
                    },
                ],
                parcoords: [
                    {
                        line: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "parcoords",
                    },
                ],
                pie: [
                    {
                        automargin: true,
                        type: "pie",
                    },
                ],
                scatter3d: [
                    {
                        line: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scatter3d",
                    },
                ],
                scattercarpet: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scattercarpet",
                    },
                ],
                scattergeo: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scattergeo",
                    },
                ],
                scattergl: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scattergl",
                    },
                ],
                scattermapbox: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scattermapbox",
                    },
                ],
                scatterpolargl: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scatterpolargl",
                    },
                ],
                scatterpolar: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scatterpolar",
                    },
                ],
                scatter: [
                    {
                        fillpattern: {
                            fillmode: "overlay",
                            size: 10,
                            solidity: 0.2,
                        },
                        type: "scatter",
                    },
                ],
                scatterternary: [
                    {
                        marker: {
                            colorbar: {
                                outlinewidth: 0,
                                ticks: "",
                            },
                        },
                        type: "scatterternary",
                    },
                ],
                surface: [
                    {
                        colorbar: {
                            outlinewidth: 0,
                            ticks: "",
                        },
                        colorscale: [
                            [0.0, "#0d0887"],
                            [0.1111111111111111, "#46039f"],
                            [0.2222222222222222, "#7201a8"],
                            [0.3333333333333333, "#9c179e"],
                            [0.4444444444444444, "#bd3786"],
                            [0.5555555555555556, "#d8576b"],
                            [0.6666666666666666, "#ed7953"],
                            [0.7777777777777778, "#fb9f3a"],
                            [0.8888888888888888, "#fdca26"],
                            [1.0, "#f0f921"],
                        ],
                        type: "surface",
                    },
                ],
                table: [
                    {
                        cells: {
                            fill: {
                                color: "#EBF0F8",
                            },
                            line: {
                                color: "white",
                            },
                        },
                        header: {
                            fill: {
                                color: "#C8D4E3",
                            },
                            line: {
                                color: "white",
                            },
                        },
                        type: "table",
                    },
                ],
            },
            layout: {
                annotationdefaults: {
                    arrowcolor: "#2a3f5f",
                    arrowhead: 0,
                    arrowwidth: 1,
                },
                autotypenumbers: "strict",
                coloraxis: {
                    colorbar: {
                        outlinewidth: 0,
                        ticks: "",
                    },
                },
                colorscale: {
                    diverging: [
                        [0, "#8e0152"],
                        [0.1, "#c51b7d"],
                        [0.2, "#de77ae"],
                        [0.3, "#f1b6da"],
                        [0.4, "#fde0ef"],
                        [0.5, "#f7f7f7"],
                        [0.6, "#e6f5d0"],
                        [0.7, "#b8e186"],
                        [0.8, "#7fbc41"],
                        [0.9, "#4d9221"],
                        [1, "#276419"],
                    ],
                    sequential: [
                        [0.0, "#0d0887"],
                        [0.1111111111111111, "#46039f"],
                        [0.2222222222222222, "#7201a8"],
                        [0.3333333333333333, "#9c179e"],
                        [0.4444444444444444, "#bd3786"],
                        [0.5555555555555556, "#d8576b"],
                        [0.6666666666666666, "#ed7953"],
                        [0.7777777777777778, "#fb9f3a"],
                        [0.8888888888888888, "#fdca26"],
                        [1.0, "#f0f921"],
                    ],
                    sequentialminus: [
                        [0.0, "#0d0887"],
                        [0.1111111111111111, "#46039f"],
                        [0.2222222222222222, "#7201a8"],
                        [0.3333333333333333, "#9c179e"],
                        [0.4444444444444444, "#bd3786"],
                        [0.5555555555555556, "#d8576b"],
                        [0.6666666666666666, "#ed7953"],
                        [0.7777777777777778, "#fb9f3a"],
                        [0.8888888888888888, "#fdca26"],
                        [1.0, "#f0f921"],
                    ],
                },
                colorway: ["#636efa", "#EF553B", "#00cc96", "#ab63fa", "#FFA15A", "#19d3f3", "#FF6692", "#B6E880", "#FF97FF", "#FECB52"],
                font: {
                    color: "#2a3f5f",
                },
                geo: {
                    bgcolor: "white",
                    lakecolor: "white",
                    landcolor: "#E5ECF6",
                    showlakes: true,
                    showland: true,
                    subunitcolor: "white",
                },
                hoverlabel: {
                    align: "left",
                },
                hovermode: "closest",
                mapbox: {
                    style: "light",
                },
                paper_bgcolor: "white",
                plot_bgcolor: "#E5ECF6",
                polar: {
                    angularaxis: {
                        gridcolor: "white",
                        linecolor: "white",
                        ticks: "",
                    },
                    bgcolor: "#E5ECF6",
                    radialaxis: {
                        gridcolor: "white",
                        linecolor: "white",
                        ticks: "",
                    },
                },
                scene: {
                    xaxis: {
                        backgroundcolor: "#E5ECF6",
                        gridcolor: "white",
                        gridwidth: 2,
                        linecolor: "white",
                        showbackground: true,
                        ticks: "",
                        zerolinecolor: "white",
                    },
                    yaxis: {
                        backgroundcolor: "#E5ECF6",
                        gridcolor: "white",
                        gridwidth: 2,
                        linecolor: "white",
                        showbackground: true,
                        ticks: "",
                        zerolinecolor: "white",
                    },
                    zaxis: {
                        backgroundcolor: "#E5ECF6",
                        gridcolor: "white",
                        gridwidth: 2,
                        linecolor: "white",
                        showbackground: true,
                        ticks: "",
                        zerolinecolor: "white",
                    },
                },
                shapedefaults: {
                    line: {
                        color: "#2a3f5f",
                    },
                },
                ternary: {
                    aaxis: {
                        gridcolor: "white",
                        linecolor: "white",
                        ticks: "",
                    },
                    baxis: {
                        gridcolor: "white",
                        linecolor: "white",
                        ticks: "",
                    },
                    bgcolor: "#E5ECF6",
                    caxis: {
                        gridcolor: "white",
                        linecolor: "white",
                        ticks: "",
                    },
                },
                title: {
                    x: 0.05,
                },
                xaxis: {
                    automargin: true,
                    gridcolor: "white",
                    linecolor: "white",
                    ticks: "",
                    title: {
                        standoff: 15,
                    },
                    zerolinecolor: "white",
                    zerolinewidth: 2,
                },
                yaxis: {
                    automargin: true,
                    gridcolor: "white",
                    linecolor: "white",
                    ticks: "",
                    title: {
                        standoff: 15,
                    },
                    zerolinecolor: "white",
                    zerolinewidth: 2,
                },
            },
        },
        width,
        xaxis: {
            anchor: "y",
            domain: [0.0, 1.0],
            title: {
                text: valueColumnName,
            },
        },
        yaxis: {
            anchor: "x",
            domain: [0.0, 1.0],
            title: {
                text: "count",
            },
        },
    }
    const arg2 = { displayModeBar: false, responsive }
    const templateNameForValue = valueColumnName.replace("\\", "\\\\").replace("/", "\u002f").replace("<", "\u003e").replace(">", "\u003c")
    // auto-set numberOfBins
    if (!numberOfBins) {
        const uniqueValues = new Set(dataframe[valueColumnName])
        const numberOfUniqueValues = uniqueValues.size
        const numberOfNonFalseyNonNumericEntries = [...uniqueValues].filter(each=>each&&((each-0)!=(each-0))).length
        const containsNonNumericData = numberOfNonFalseyNonNumericEntries > numberOfUniqueValues*0.5
        if (containsNonNumericData) {
            numberOfBins = numberOfUniqueValues
        } else {
            const uniqueNumericValues = [...uniqueValues].filter(each=>(each-0)==(each-0))
            const max = Math.max(...uniqueNumericValues)
            const min = Math.min(...uniqueNumericValues)
            const range = max-min
            // the following equation approximately hits these points:
            // 1        => 1
            // 10       => 6
            // 100      => 32
            // 1000     => 90
            // 10000    => 128
            // 100000   => 137
            // 1000000  => 138
            numberOfBins = Math.round(139.1036 + (0.01280097 - 139.1036)/(1 + Math.pow((numberOfUniqueValues/448.8747),0.7931833)))
            numberOfBins *= binMultiplier
        }
    }
    // TODO: the = and % are special to plotly... but plotly itself doesnt escape them
    //       so IDK, a bug report should probably be filed with plotly and then 
    //       the fix (once created) should be implemented here as an escape
    if (!groupColumnName) {
        data.push({
            alignmentgroup: "True",
            bingroup: "x",
            hovertemplate: `${valueColumnName}=%{x}\u003cbr\u003ecount=%{y}`, // TODO: add other info here e.g. hovertemplate: "the_x_column_name=%{x}\u003cbr\u003ecount=%{y}\u003cextra\u003e\u003c\u002fextra\u003e",
            legendgroup: "",
            marker: {
                opacity,
                color: wrapAroundGet(0, colorOptions), 
                pattern: { shape: "" },
            },
            name: "",
            offsetgroup: "",
            nbinsx: numberOfBins,
            orientation: "v",
            showlegend: false,
            x: dataframe[valueColumnName],
            xaxis: "x",
            yaxis: "y",
            type: "histogram",
        })
    } else {
        const groupNames = new Set(dataframe[groupColumnName])
        const groups = {}
        for (const each of groupNames) {
            groups[each] = []
        }
        for (const [groupName, value] of zip(dataframe[groupColumnName], dataframe[valueColumnName])) {
            groups[groupName].push(value)
        }
        for (const [index, each] of enumerate(Object.entries(groups)) ) {
            const [ eachGroupName, xValues ] = each
            data.push({
                alignmentgroup: "True",
                bingroup: "x",
                hovertemplate: `${valueColumnName}=%{x}\u003cbr\u003ecount=%{y}`, // TODO: add other info here e.g. hovertemplate: "the_x_column_name=%{x}\u003cbr\u003ecount=%{y}\u003cextra\u003e\u003c\u002fextra\u003e",
                legendgroup: eachGroupName,
                marker: {
                    opacity,
                    color: wrapAroundGet(index, colorOptions), 
                    pattern: { shape: "" },
                },
                name: eachGroupName,
                offsetgroup: eachGroupName,
                nbinsx: numberOfBins,
                orientation: "v",
                showlegend: true,
                x: xValues,
                xaxis: "x",
                yaxis: "y",
                type: "histogram",
            })
        }
    }
    const encoded = (new TextEncoder()).encode(JSON.stringify([ data, arg1, arg2 ]).slice(1,-1))
    return concatUint8Arrays([
        uint8ArrayForHistogramHtml,
        encoded,
        histogramEndBytes,
    ])
}

// example usage:
// FileSystem.write({
//     path: `${flags.output}/summary_of_most_similar.histogram.html`,
//     data: histogramHtmlBytes({
//         dataframe: {
//             x: summaryData.map(each=>each[indexOfScore]),
//         },
//         valueColumnName: "x",
//     }),
// }),