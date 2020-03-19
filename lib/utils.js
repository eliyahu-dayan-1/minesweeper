function createRandWord(minLength = 3, maxLength = 5) {
    var randWord = "",
        maxIteration = genarateRandomNum(minLength,maxLength);

    for (var i = 1; i <= maxIteration; i++) {
        randWord +=  String.fromCharCode(genarateRandomNum(97,122));
    }

    return randWord;
}

function genarateRandomNum(min, max){

    return Math.floor(Math.random() * (max - min + 1) + min);
}

function genarateRandomStringNum(min, max, longNum){
    var finalNum = ""
    for (var i = 1; i <= longNum ; i++) {
        finalNum += Math.floor(Math.random() * (max - min + 1) + min);
    }
    return parseInt(finalNum);
}