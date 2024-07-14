import PaymentModel from "../models/PaymentModel.js";


export const addMonthsToDate = (currDate, monthsToAdd) => {
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


export const getValidityFromDuration = (durationUnit, durationAmount, baseDate)=>{
    //baseDate : is the date in which we have to add duration to form new validity;
    let increasedValidity = new Date(baseDate);
    switch(durationUnit){
        case 'days':
            increasedValidity.setDate(increasedValidity.getDate() + Number(durationAmount));
                break;
            
            case 'months':
                increasedValidity = addMonthsToDate(baseDate, Number(durationAmount));
                break;
            }
            
            return increasedValidity;
            
        }

        export const isPrevPendingPaymentForSameService = async (currPayment, serviceId) => {
            try {
                // Find the current payment
                // Find the previous payment for the same service
                const prevPayments = await PaymentModel.findOne({
                    organization : currPayment.organization,
                    chargedOn : currPayment.chargedOn, 
                    status: 'pending',
                    service: serviceId,
                    createdAt: { $lt: currPayment.createdAt } // Finding payments created earlier than the current payment
                })?.sort({ createdAt: -1 }); // Sorting in descending order of creation date to get the latest previous payment
                return (prevPayments == null) ? false : true; 
                
            } catch (error) {
                throw new Error(error.message);
            }
        }   

    // var currdate = new Date(2023,1,28); // December 31, 2023
    // console.log("currdate", currdate.toLocaleDateString());
    // var newdate = getValidityFromDuration('days',1, currdate);
    // console.log("newdate validity", newdate.toLocaleDateString());