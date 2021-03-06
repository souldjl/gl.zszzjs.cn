"use strict";
import axios from 'axios'
import qs from 'qs'

function toQueryString2(obj) {
    if( !obj ) {
        return ''
    }

    let pairs = []
    Object.keys(obj).map(function (key) {
        let val = obj[key];
        if( val == null ) {
            val = ''
        }

        if( Array.isArray(val) ) {
            let index = 0
            let arr = val

            for(let item of arr ) {
                if( item !== null && typeof item === 'object' ) {
                    Object.keys(item).map(function( k ){
                        let k1 = encodeURIComponent(key)
                        let k2 = encodeURIComponent(k)
                        let v  = encodeURIComponent(item[k])
                        pairs.push(`${k1}[${index}][${k2}]=${v}`)
                    })
                } else {
                    pairs.push(`${key}[${index}]=${item}`)
                }
                index++
            }
        } else if( val !== null && typeof val === 'object' ) {
            Object.keys(val).map(function( k ){
                let k1 = encodeURIComponent(key)
                let k2 = encodeURIComponent(k)
                let v  = encodeURIComponent(val[k])
                pairs.push(`${k1}[${k2}]=${v}`)
            })
        }else{
            pairs.push( encodeURIComponent(key) + '=' + encodeURIComponent(val) )
        }
    })

    let p = pairs.join('&')
    return p
}

function toQueryString(obj) {
    return obj ? Object.keys(obj).sort().map(function (key) {
        let val = obj[key];

        if( val == null ) {
            val = ''
        }

        // console.log( 'val:', val )

        if (Array.isArray(val)) {
            return val.sort().map(function (val2) {
                return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
            }).join('&');
        }
        return encodeURIComponent(key) + '=' + encodeURIComponent(val);
    }).join('&') : '';
}

function toQueryString3(obj) {
    return qs.stringify(obj)
}

function getData( { url, params={}, raw=false } ) {
    return _fetchData( { url, method:'get', data:{}, params, raw } )
}

function postData( { url, params={}, data={}, raw=false } ) {
    return _fetchData( { url, method:'post', params, data, raw } )
}

async function _fetchData( { url, method, params, data, raw=false } ) {
    let respObj, resp;
    try{
        respObj = await axios.request({
            url,
            method,
            params,
            paramsSerializer: toQueryString3,
            data: method=='post' ? toQueryString3(data) : null,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        resp = respObj.data;
        if( raw ) {
            return resp;
        }
    } catch(e) {
        console.log('ajax error', url, e);
        if( raw ) await Promise.reject(e);
        await Promise.reject({
            ecode: -1,
            emsg: '网络故障',
        });
    }

    if( resp.ecode == 0 ) {
        return resp.data;
    }else{
        await Promise.reject( resp );
    }
}

const webTools = {
    toQueryString,
    getData,
    postData,
};

export { webTools as default };
