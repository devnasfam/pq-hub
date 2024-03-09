export const detectLevel = (admNumber, department) => {
    const currentYear = new Date().getFullYear();
    const entryYear = Number('20' + admNumber.slice(0, 2));
    let levelYear = currentYear - entryYear;

    const fiveYearCourses = ['Engineering', 'Agriculture'];
    const sevenYearCourses = ['Medicine'];

    if (entryYear <= 2022 && levelYear !== 'Graduate') {
        levelYear -= 2;
    }

    if (levelYear === 0) {
        return '100L';
    } else if (levelYear === 1) {
        return '200L';
    } else if (levelYear === 2) {
        return '300L';
    } else if (levelYear === 3) {
        return '400L';
    } else if (levelYear === 4 && (!fiveYearCourses.includes(department) && !sevenYearCourses.includes(department))) {
        return 'Graduate';
    } else if (levelYear > 4 && fiveYearCourses.includes(department)) {
        return '500L';
    } else if (levelYear > 5 && fiveYearCourses.includes(department)) {
        return 'Graduate';
    } else if (levelYear === 4 && sevenYearCourses.includes(department)) {
        return '500L';
    } else if (levelYear === 5 && sevenYearCourses.includes(department)) {
        return '600L';
    } else if (levelYear === 6 && sevenYearCourses.includes(department)) {
        return '700L';
    } else if (levelYear === 7 && sevenYearCourses.includes(department)) {
        return 'Graduate';
    } else {
        return 'Graduate';
    }
};
