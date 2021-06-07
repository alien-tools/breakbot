//const fetch = require('node-fetch');

async function formattingMessage(branch: string) {
    var n = 0; //will be updated with the 
    var ret = "";

    //Greetings (optional)
    ret += "## Hello, my name is BreakBot !\n"

    //Base declaration
    ret += "### This PR introduce " + n + " breaking changes in the branch " + branch;

    //Detail on the BC

    return ret;
}

export { formattingMessage };