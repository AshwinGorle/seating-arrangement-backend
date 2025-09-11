import Razorpay from "razorpay";

class RazorpayProvider {
    constructor() {
        // Assign the Razorpay instance to the object instance
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID, // Replace with your Razorpay Key ID
            key_secret: process.env.RAZORPAY_SECRET // Replace with your Razorpay Key Secret
        });
    }

    // Optional: You can add methods to interact with Razorpay here if needed.
}

export default RazorpayProvider;
