module.exports = {
    apps: [
        {
            name:"server",
            script:"./server.js",
            watch: true,
            error_file:"./logs/error.log",
            out_file:"./logs/info.log",
            log_file:"./logs/combined.log"
            env: {
                "NODE_ENV": "production"
            }
        }
    ]
}
