const addMonthsToDate = (currDate, monthsToAdd) => {
    let resultDate = new Date(currDate);
    let resultMonth = resultDate.getMonth() + monthsToAdd;
    let resultYear = resultDate.getFullYear();

    if(resultMonth > 11){
        resultYear += Math.floor(resultMonth/12);
        resultMonth %= 12;
    }
    
    
    if(resultMonth == 1){
        const isLeapYear = (resultYear % 4 == 0 && resultYear % 100 != 0) || resultYear % 400 == 0;
        if(!isLeapYear && resultDate.getDate() > 28){
            resultDate.setDate(28);
        }else if(isLeapYear && resultDate.getDate() > 29){
            resultDate.setDate(29);
        }
    }
    resultDate.setMonth(resultMonth);
    resultDate.setFullYear(resultYear);
    return resultDate;

}


const getValidityFromDuration = (durationUnit, durationAmount, baseDate)=>{
    //baseDate : is the date in which we have to add duration to form new validity;
    let increasedValidity = new Date(baseDate);
    switch(durationUnit){
        case 'days':
            increasedValidity.setDate(increasedValidity.getDate() + Number(durationAmount));
                break;
            
            case 'months':
                increasedValidity = addMonthsToDate(baseDate, durationAmount);
                break;
            }
            
            return increasedValidity;
            
        }

        const oldDate = new Date( Date.now());
        const newDate = getValidityFromDuration("months", 2, oldDate);
        console.log(oldDate);
        console.log(newDate)