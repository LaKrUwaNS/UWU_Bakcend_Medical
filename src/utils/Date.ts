// !15 min
export const MinfromNow = (minutes: number): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}

// !Day
export const DayfromNow = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
}

// !mounth
export const MounthfromNow = (months: number): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    return date;
}

// !Year
export const YearfromNow = (years: number): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + years);
    return date;
}

// !Hour
export const HarfanhourfromNow = (hours: number): Date => {
    const date = new Date();
    date.setHours(date.getHours() + hours);
    return date;
}