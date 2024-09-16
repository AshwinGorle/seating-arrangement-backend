const generateOtp = (length) => {
    if (length <= 0) {
      throw new Error("Length must be greater than 0");
    }
  
    // Calculate the minimum and maximum numbers for the given length
    const min = Math.pow(10, length - 1);
    const max = Math.pow(10, length) - 1;
  
    // Generate a random number within the range
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  export default generateOtp;