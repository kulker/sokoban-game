<?php 
 function get_web_page( $url )
    {
        $user_agent='Mozilla/5.0 (Windows NT 6.1; rv:8.0) Gecko/20100101 Firefox/8.0';

        $options = array(
            CURLOPT_CUSTOMREQUEST  =>"GET",        //set request type post or get
            CURLOPT_POST           =>false,        //set to GET
            CURLOPT_USERAGENT      => $user_agent, //set user agent
            CURLOPT_COOKIEFILE     =>"cookie.txt", //set cookie file
            CURLOPT_COOKIEJAR      =>"cookie.txt", //set cookie jar
            CURLOPT_RETURNTRANSFER => true,     // return web page
            CURLOPT_HEADER         => false,    // don't return headers
            CURLOPT_FOLLOWLOCATION => true,     // follow redirects
            CURLOPT_ENCODING       => "",       // handle all encodings
            CURLOPT_AUTOREFERER    => true,     // set referer on redirect
            CURLOPT_CONNECTTIMEOUT => 190,      // timeout on connect
            CURLOPT_TIMEOUT        => 190,      // timeout on response
            CURLOPT_MAXREDIRS      => 10,       // stop after 10 redirects
			CURLOPT_SSL_VERIFYHOST =>1,
			CURLOPT_SSL_VERIFYPEER =>TRUE
        );

        $ch      = @curl_init( $url );
        @curl_setopt_array( $ch, $options );
        $content = curl_exec( $ch );
        $err     = curl_errno( $ch );
        $errmsg  = curl_error( $ch );
        $header  = curl_getinfo( $ch );
        curl_close( $ch );

        $header['errno']   = $err;
        $header['errmsg']  = $errmsg;
        $header['content'] = $content;
        return $header;
    }

function get_string_between($string, $start, $end){
    $string = ' ' . $string;
    $ini = mb_strpos( $string, $start,0,'UTF-8');
    if ($ini == 0) return '';
    $ini += mb_strlen($start,'UTF-8');
    $len = mb_strpos($string, $end, $ini,'UTF-8') - $ini;
    return mb_substr($string, $ini, $len,'UTF-8');
}


?>