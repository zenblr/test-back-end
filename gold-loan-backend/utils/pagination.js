const check = require('../lib/checkLib');


let paginationWithFromTo = (searchParameter, fromParameter, toParameter) => {
    let search = check.isEmpty(searchParameter) ? "" : searchParameter;
    let from = check.isEmpty(fromParameter) ? 1 : fromParameter;
    let to = check.isEmpty(toParameter) ? 25 : toParameter;
    let pageSize = Number((to - from) + 1);
    let offset = Number(from - 1);
    return { search, offset, pageSize };
}

let paginationWithPageNumberPageSize = (searchParameter, pageNumberParameter, pageSizeParameter) => {
    let username = check.isEmpty(searchParameter) ? "" : searchParameter;
    let pageNumber = !check.isEmpty(pageNumberParameter) ? pageNumberParameter : 1;
    let pageSize = pageSizeParameter || 25;
    if (pageSize != 0 && pageNumber != 0) {
        userOffset = (pageSize * (pageNumber - 1));
    }
    return { username, userOffset, pageSize, pageNumber };
}

let NextAndPrevPageNumber = (pageNumberParameter, pageSizeParameter, userCount) => {
    let currentObject = pageNumberParameter * pageSizeParameter;
    let prev = currentObject == pageSizeParameter ? null : Number(pageNumberParameter) - 1;
    let next = currentObject >= userCount ? null : Number(pageNumberParameter) + 1;
    let lastPage = Math.ceil(userCount / pageSizeParameter);

    return { next, prev, lastPage };

}

module.exports = {
    paginationWithFromTo: paginationWithFromTo,
    paginationWithPageNumberPageSize: paginationWithPageNumberPageSize,
    NextAndPrevPageNumber: NextAndPrevPageNumber
}