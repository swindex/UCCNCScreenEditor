const bcrypt = require('bcryptjs');

module.exports = {
    /**
     * Remove keys with nullish values from the object.
     * Useful when updating database records
     * Returns a copy of the object with nullish values removed.
     * @template T
     * @param {T} obj 
     * @returns {T}
     */
    removeNulls(obj){
        ret = {}
        Object.keys(obj).forEach((key)=> {
            if (obj[key]!=null) {
              ret[key] = obj[key];
            }
        });
        return ret
    },
    async hashPassword(value) {
        return await bcrypt.hash(value, 10);
    }
}