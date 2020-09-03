module.exports = {
    apps: [
        {
            name:"server",
            script:"./server.js",
            error_file:"./logs/pm2/error.log",
            out_file:"./logs/pm2/info.log",
            log_file:"./logs/pm2/combined.log",
            env: {
                "NODE_ENV": "production"
            }
        }
    ]
}
