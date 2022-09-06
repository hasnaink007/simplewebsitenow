export const getURLParam = (name) => {
    /* let search = window.location.search.split('?')[1]
    let params = {}
    if(search){
        search.split('&').forEach( param => params[param.split('=')[0]] = param.split('=')[1])
    } */
    // return params[name]
    return new URL(window.location.href).searchParams.get(name)
}

export const getAuth = () => {
    return {Authorization: window.localStorage.simpleWebsiteToken}
}