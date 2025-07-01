import { Database } from '../database/database';
import { Airline, Feature, Implementation, CreateAirlineRequest, UpdateAirlineRequest, CreateFeatureRequest, UpdateFeatureRequest, CreateImplementationRequest, UpdateImplementationRequest, NotFoundError, DatabaseError } from '../types';

export class DatabaseService {
  private db: Database;

  constructor(database: Database) {
    this.db = database;
  }

  // Airlines methods
  async getAllAirlines(): Promise<Airline[]> {
    try {
      return await this.db.all('SELECT * FROM airlines ORDER BY name');
    } catch (error) {
      throw new DatabaseError(`Failed to fetch airlines: ${error}`);
    }
  }

  async getAirlineById(id: number): Promise<Airline> {
    try {
      const airline = await this.db.get('SELECT * FROM airlines WHERE id = ?', [id]);
      if (!airline) {
        throw new NotFoundError(`Airline with ID ${id} not found`);
      }
      return airline;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch airline: ${error}`);
    }
  }

  async createAirline(airlineData: CreateAirlineRequest): Promise<Airline> {
    try {
      const result = await this.db.run(
        'INSERT INTO airlines (name, codes, provider, status) VALUES (?, ?, ?, ?)',
        [airlineData.name, airlineData.codes, airlineData.provider, airlineData.status]
      );
      
      return await this.getAirlineById(result.lastID);
    } catch (error) {
      throw new DatabaseError(`Failed to create airline: ${error}`);
    }
  }

  async updateAirline(id: number, updates: UpdateAirlineRequest): Promise<Airline> {
    try {
      // Check if airline exists
      await this.getAirlineById(id);
      
      const fields = [];
      const values = [];
      
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.codes !== undefined) {
        fields.push('codes = ?');
        values.push(updates.codes);
      }
      if (updates.provider !== undefined) {
        fields.push('provider = ?');
        values.push(updates.provider);
      }
      if (updates.status !== undefined) {
        fields.push('status = ?');
        values.push(updates.status);
      }
      
      if (fields.length === 0) {
        return await this.getAirlineById(id);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      await this.db.run(
        `UPDATE airlines SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return await this.getAirlineById(id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update airline: ${error}`);
    }
  }

  async deleteAirline(id: number): Promise<void> {
    try {
      // Check if airline exists
      await this.getAirlineById(id);
      
      const result = await this.db.run('DELETE FROM airlines WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new NotFoundError(`Airline with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete airline: ${error}`);
    }
  }

  // Features methods
  async getAllFeatures(): Promise<Feature[]> {
    try {
      return await this.db.all('SELECT * FROM features ORDER BY category, name');
    } catch (error) {
      throw new DatabaseError(`Failed to fetch features: ${error}`);
    }
  }

  async getFeatureById(id: number): Promise<Feature> {
    try {
      const feature = await this.db.get('SELECT * FROM features WHERE id = ?', [id]);
      if (!feature) {
        throw new NotFoundError(`Feature with ID ${id} not found`);
      }
      return feature;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch feature: ${error}`);
    }
  }

  async createFeature(featureData: CreateFeatureRequest): Promise<Feature> {
    try {
      const result = await this.db.run(
        'INSERT INTO features (category, name, description) VALUES (?, ?, ?)',
        [featureData.category, featureData.name, featureData.description || null]
      );
      
      return await this.getFeatureById(result.lastID);
    } catch (error) {
      throw new DatabaseError(`Failed to create feature: ${error}`);
    }
  }

  async updateFeature(id: number, updates: UpdateFeatureRequest): Promise<Feature> {
    try {
      // Check if feature exists
      await this.getFeatureById(id);
      
      const fields = [];
      const values = [];
      
      if (updates.category !== undefined) {
        fields.push('category = ?');
        values.push(updates.category);
      }
      if (updates.name !== undefined) {
        fields.push('name = ?');
        values.push(updates.name);
      }
      if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
      }
      
      if (fields.length === 0) {
        return await this.getFeatureById(id);
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      await this.db.run(
        `UPDATE features SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
      
      return await this.getFeatureById(id);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update feature: ${error}`);
    }
  }

  async deleteFeature(id: number): Promise<void> {
    try {
      // Check if feature exists
      await this.getFeatureById(id);
      
      const result = await this.db.run('DELETE FROM features WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new NotFoundError(`Feature with ID ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete feature: ${error}`);
    }
  }

  // Implementations methods
  async getAllImplementations(): Promise<Implementation[]> {
    try {
      return await this.db.all('SELECT * FROM implementations ORDER BY airline_id, feature_id');
    } catch (error) {
      throw new DatabaseError(`Failed to fetch implementations: ${error}`);
    }
  }

  async getImplementationById(id: number): Promise<Implementation> {
    try {
      const implementation = await this.db.get('SELECT * FROM implementations WHERE id = ?', [id]);
      if (!implementation) {
        throw new NotFoundError(`Implementation with ID ${id} not found`);
      }
      return implementation;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch implementation: ${error}`);
    }
  }

  async getImplementationByAirlineAndFeature(airlineId: number, featureId: number): Promise<Implementation | null> {
    try {
      const implementation = await this.db.get(
        'SELECT * FROM implementations WHERE airline_id = ? AND feature_id = ?',
        [airlineId, featureId]
      );
      return implementation || null;
    } catch (error) {
      throw new DatabaseError(`Failed to fetch implementation: ${error}`);
    }
  }

  async createImplementation(implementationData: CreateImplementationRequest): Promise<Implementation> {
    try {
      // Check if airline and feature exist
      await this.getAirlineById(implementationData.airline_id);
      await this.getFeatureById(implementationData.feature_id);
      
      const result = await this.db.run(
        'INSERT INTO implementations (airline_id, feature_id, value, notes) VALUES (?, ?, ?, ?)',
        [implementationData.airline_id, implementationData.feature_id, implementationData.value, implementationData.notes || null]
      );
      
      return await this.getImplementationById(result.lastID);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to create implementation: ${error}`);
    }
  }

  async updateImplementation(airlineId: number, featureId: number, updates: UpdateImplementationRequest): Promise<Implementation> {
    try {
      const existing = await this.getImplementationByAirlineAndFeature(airlineId, featureId);
      if (!existing) {
        throw new NotFoundError(`Implementation for airline ${airlineId} and feature ${featureId} not found`);
      }
      
      const fields = [];
      const values = [];
      
      if (updates.value !== undefined) {
        fields.push('value = ?');
        values.push(updates.value);
      }
      if (updates.notes !== undefined) {
        fields.push('notes = ?');
        values.push(updates.notes);
      }
      
      if (fields.length === 0) {
        return existing;
      }
      
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(airlineId, featureId);
      
      await this.db.run(
        `UPDATE implementations SET ${fields.join(', ')} WHERE airline_id = ? AND feature_id = ?`,
        values
      );
      
      return await this.getImplementationByAirlineAndFeature(airlineId, featureId) as Implementation;
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to update implementation: ${error}`);
    }
  }

  async deleteImplementation(airlineId: number, featureId: number): Promise<void> {
    try {
      const existing = await this.getImplementationByAirlineAndFeature(airlineId, featureId);
      if (!existing) {
        throw new NotFoundError(`Implementation for airline ${airlineId} and feature ${featureId} not found`);
      }
      
      await this.db.run('DELETE FROM implementations WHERE airline_id = ? AND feature_id = ?', [airlineId, featureId]);
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to delete implementation: ${error}`);
    }
  }

  // Query methods for complex data retrieval
  async getAirlineWithImplementations(airlineId: number): Promise<any> {
    try {
      const airline = await this.getAirlineById(airlineId);
      const implementations = await this.db.all(`
        SELECT 
          i.*,
          f.name as feature_name,
          f.category as feature_category,
          f.description as feature_description
        FROM implementations i
        JOIN features f ON i.feature_id = f.id
        WHERE i.airline_id = ?
        ORDER BY f.category, f.name
      `, [airlineId]);
      
      return {
        ...airline,
        implementations
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch airline with implementations: ${error}`);
    }
  }

  async getFeatureWithImplementations(featureId: number): Promise<any> {
    try {
      const feature = await this.getFeatureById(featureId);
      const implementations = await this.db.all(`
        SELECT 
          i.*,
          a.name as airline_name,
          a.codes as airline_codes,
          a.provider as airline_provider,
          a.status as airline_status
        FROM implementations i
        JOIN airlines a ON i.airline_id = a.id
        WHERE i.feature_id = ?
        ORDER BY a.name
      `, [featureId]);
      
      return {
        ...feature,
        implementations
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new DatabaseError(`Failed to fetch feature with implementations: ${error}`);
    }
  }
}