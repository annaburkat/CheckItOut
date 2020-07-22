class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  // 1/ FILTERING
  filtering() {
    //  1A/ FILTERING
    const queryObj = {
      ...this.queryString
    };
    const ignoredFileds = ['sort', 'page', 'limit', 'fields'];
    ignoredFileds.forEach(x => delete queryObj[x]);

    //  1B/ ADVANCED FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // 2/ SORTING
  sorting() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy)
    } else {
      // finalQuery = finalQuery.sort('name');
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  // 3. DATA LIMITING
  limiting() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      //extra feature - not show some stuff
      //createdAt hidden in model
      this.query = this.query.select('-__v')
    }
    return this;
  }

  // 4. PAGINTION
  paginating() {
    const page = parseInt(this.queryString.page) || 1;
    const limit = parseInt(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures;
