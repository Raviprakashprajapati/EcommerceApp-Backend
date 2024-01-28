export const corsMiddleware  = (req,res,next) =>{
    res.header('Access-Control-Allow-Origin', 'https://flipmarts.netlify.app');
    res.header('Access-Control-Allow-Credentials', true);
    next();
}

