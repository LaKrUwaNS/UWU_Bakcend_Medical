import { DateTime } from "luxon";

// Get current Sri Lankan time
export const Now = () => {
    return DateTime.now().setZone("Asia/Colombo").toJSDate();
};

// Get time 15 minutes from now in Sri Lankan time
export const FifteenMinutesFromNow = () => {
    return DateTime.now().setZone("Asia/Colombo").plus({ minutes: 15 }).toJSDate();
};

// Get time 1 day from now in Sri Lankan time
export const OneDayFromNow = () => {
    return DateTime.now().setZone("Asia/Colombo").plus({ days: 1 }).toJSDate();
};

// Get time 2 days from now in Sri Lankan time
export const TwoDaysFromNow = () => {
    return DateTime.now().setZone("Asia/Colombo").plus({ days: 2 }).toJSDate();
};

// Get time 7 days from now in Sri Lankan time
export const SevenDaysFromNow = () => {
    return DateTime.now().setZone("Asia/Colombo").plus({ days: 7 }).toJSDate();
};
