

const checkOrganization = (owner, member)=>{
     if(owner.organization != member.organization){
        return res.send({status : "failed", message : "Member does not belongs to your organization!"});
    }
    return 
}

export default checkOrganization;