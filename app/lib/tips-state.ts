export function buildTipsSummary(data:Record<string,string>){return Object.entries(data).filter(([,value])=>value).map(([key,value])=>`${key}: ${value}`).join("\n")}
export function canAdvanceTipsStep(step:number,steps:readonly string[],data:Record<string,string>){return step>=steps.length-1||Boolean(data[steps[step]])}
