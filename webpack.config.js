export const module = {
    rules: [
        {
            // The delimiter of path fragment of stupid windows has the format "//"
            test: /\.js$/,
            include: /examples/,
            use: [
                {
                    loader: "three-contrib-loader"
                }
            ]
        },
        {
            test: /\.сss$/,
            exclude: /node_modules/,
            use: [
                'style-loader',
                'css-loader',
                'resolve-url',
                'sass-loader'
            ]
        },
        {
            test: /\.(js|jsx)$/,
            exclude: /(node_mordules|bower_components)/,
            use: [
                'babel-loader'
            ]
        }
    ]
};