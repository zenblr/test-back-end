module.exports = (searchItem, prop, array)=>{
    for (var i=0; i < array.length; i++) {
        if (array[i][prop] === searchItem) {
            return array[i];
        }
    }
}