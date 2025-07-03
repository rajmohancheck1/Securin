class APIFeatures {
    constructor(query, queryStr){
        this.query = query;
        this.queryStr = queryStr;
    }

    search(){
        const searchQuery = {};

        // Handle title search
        if (this.queryStr.title) {
            searchQuery.title = {
                $regex: this.queryStr.title,
                $options: 'i'
            };
        }

        // Handle cuisine search
        if (this.queryStr.cuisine) {
            searchQuery.cuisine = {
                $regex: this.queryStr.cuisine,
                $options: 'i'
            };
        }

        this.query = this.query.find(searchQuery);
        return this;
    }

    filter(){
        const queryCopy = { ...this.queryStr };
        
        // Remove fields that shouldn't be used for filtering
        const removeFields = ['keyword', 'limit', 'page', 'title', 'cuisine'];
        removeFields.forEach(field => delete queryCopy[field]);

        // Handle numeric comparisons
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    paginate(resPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;