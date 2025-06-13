// 15 minutes from now
export const MinFromNow = (): Date => {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 15);
    return date;
}

// 1 day from now
export const DayFromNow = (): Date => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date;
}

// 1 month from now
export const MonthFromNow = (): Date => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date;
}

// 1 year from now
export const YearFromNow = (): Date => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date;
}

// 1 hour from now
export const HourFromNow = (): Date => {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return date;
}
