const app = require('./app');
require('colors');



/* start server */
const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server started on port ${port}`.blue.bold);
    }
);
