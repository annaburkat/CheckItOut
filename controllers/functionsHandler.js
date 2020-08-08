const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppErrorFirst');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = (Model) => catchAsync(async (req, res, next) => {
  const document = await Model.findByIdAndDelete(req.params.id);
  console.log('print', document, req.params)

  if (!document) {
    return next(new AppError('No document with that id?', 404))
  };

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.updateOne = (Model) => catchAsync(async (req, res, next) => {
  const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!document) {
    return next(new AppError('No document with that id', 404))
  };

  res.status(200).json({
    status: 'success',
    data: {
      data: document
    }
  });
});

exports.createOne = (Model) => catchAsync(async (req, res, next) => {
  const document = await Model.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      data: document
    }
  });
});

exports.getOne = (Model, populateOptions) => catchAsync(async (req, res, next) => {
  let query = Model.findById(req.params.id);
  if (populateOptions) {
    query.populate(populateOptions)
  };

  const document = await query;

  if (!document) {
    return next(new AppError('No document with that id', 404))
  };

  res.status(200).json({
    status: 'success',
    data: {
      data: document
    }
  });
});

exports.getAll = (Model) => catchAsync(async (req, res, next) => {
  let filter = {};

  if (req.params.placeID) {
    filter = {
      place: req.params.placeID
    }
  };

  const features = new APIFeatures(Model.find(filter), req.query)
    .filtering()
    .sorting()
    .limiting()
    .paginating();

  const document = await features.query;

  res.status(200).json(document);
});