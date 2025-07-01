import { Router, Request, Response, NextFunction } from 'express';
import { DatabaseService } from '../services/database.service';
import { CreateFeatureRequest, UpdateFeatureRequest, ApiResponse, NotFoundError, DatabaseError } from '../types';
import { body, param, validationResult } from 'express-validator';

export function createFeaturesRouter(dbService: DatabaseService): Router {
  const router = Router();

  // Validation middleware
  const validateCreateFeature = [
    body('category')
      .isIn(['Shopping', 'Global', 'Booking', 'Servicing', 'Payment'])
      .withMessage('Category must be one of: Shopping, Global, Booking, Servicing, Payment'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name is required and must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
  ];

  const validateUpdateFeature = [
    body('category')
      .optional()
      .isIn(['Shopping', 'Global', 'Booking', 'Servicing', 'Payment'])
      .withMessage('Category must be one of: Shopping, Global, Booking, Servicing, Payment'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 255 })
      .withMessage('Name must be less than 255 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Description must be less than 1000 characters'),
  ];

  const validateId = [
    param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  ];

  // Error handling middleware
  const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        message: errors.array().map(err => err.msg).join(', ')
      };
      return res.status(400).json(response);
    }
    next();
  };

  // GET /api/features - Get all features
  router.get('/', async (req: Request, res: Response) => {
    try {
      const features = await dbService.getAllFeatures();
      const response: ApiResponse = {
        success: true,
        data: features,
        message: `Found ${features.length} features`
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching features:', error);
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch features'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/features/:id - Get feature by ID
  router.get('/:id', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const feature = await dbService.getFeatureById(id);
      const response: ApiResponse = {
        success: true,
        data: feature
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching feature:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch feature'
      };
      res.status(500).json(response);
    }
  });

  // GET /api/features/:id/implementations - Get feature with implementations
  router.get('/:id/implementations', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const featureWithImplementations = await dbService.getFeatureWithImplementations(id);
      const response: ApiResponse = {
        success: true,
        data: featureWithImplementations
      };
      res.json(response);
    } catch (error) {
      console.error('Error fetching feature with implementations:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch feature with implementations'
      };
      res.status(500).json(response);
    }
  });

  // POST /api/features - Create new feature
  router.post('/', validateCreateFeature, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const featureData: CreateFeatureRequest = req.body;
      const newFeature = await dbService.createFeature(featureData);
      const response: ApiResponse = {
        success: true,
        data: newFeature,
        message: 'Feature created successfully'
      };
      res.status(201).json(response);
    } catch (error) {
      console.error('Error creating feature:', error);
      
      if (error instanceof DatabaseError && error.message.includes('UNIQUE constraint')) {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: 'A feature with this name already exists'
        };
        return res.status(409).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to create feature'
      };
      res.status(500).json(response);
    }
  });

  // PUT /api/features/:id - Update feature
  router.put('/:id', validateId, validateUpdateFeature, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const updates: UpdateFeatureRequest = req.body;
      const updatedFeature = await dbService.updateFeature(id, updates);
      const response: ApiResponse = {
        success: true,
        data: updatedFeature,
        message: 'Feature updated successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error updating feature:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      if (error instanceof DatabaseError && error.message.includes('UNIQUE constraint')) {
        const response: ApiResponse = {
          success: false,
          error: 'Conflict',
          message: 'A feature with this name already exists'
        };
        return res.status(409).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to update feature'
      };
      res.status(500).json(response);
    }
  });

  // DELETE /api/features/:id - Delete feature
  router.delete('/:id', validateId, handleValidationErrors, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      await dbService.deleteFeature(id);
      const response: ApiResponse = {
        success: true,
        message: 'Feature deleted successfully'
      };
      res.json(response);
    } catch (error) {
      console.error('Error deleting feature:', error);
      
      if (error instanceof NotFoundError) {
        const response: ApiResponse = {
          success: false,
          error: 'Not found',
          message: error.message
        };
        return res.status(404).json(response);
      }
      
      const response: ApiResponse = {
        success: false,
        error: 'Internal server error',
        message: 'Failed to delete feature'
      };
      res.status(500).json(response);
    }
  });

  return router;
}