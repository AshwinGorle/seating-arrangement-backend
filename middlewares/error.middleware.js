export const error = (err, req, res, next)=>{
    console.log("error--In---M----------", err);

    err.message = err.message || "internal server error"
    err.statusCode = err.statusCode || 500

    if(err.type == "ServerError"){
        if(err.name == "NotFound"){
            err. message = `${err.message} not found !`
        }
    }
    if(err.type == "ClientError"){
        if(err.name == "AllRequired"){A
            err. message = `All fields required!`
        }
    }

    if(err.name === "TypeError"){       // I should make different part for dev
        err.message = "Internal server error"
        err.statusCode = 500
    }
    if(err.name === "SequelizeValidationError"){
        // err.message = err.message.split("_")[1]
        err.statusCode = 400
    }
    if(err.name === "CastError"){
        err.message = `${err.path} is invalid!`
        err.statusCode = 400
    }
    if(err.code === 11000 ){
        err.message = `${Object.keys(err.keyValue)} already used, try another`
    }
    if(err.message == "Operation `users.findOne()` buffering timed out after 10000ms"){
        err.message = 'Please check your connectivity!'
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}
