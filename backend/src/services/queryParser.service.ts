import { DatabaseService } from './database.service';

export interface QueryEntities {
  airlines: string[];
  features: string[];
  statuses: string[];
  categories: string[];
  providers: string[];
  queryType: QueryType;
  confidence: number;
}

export enum QueryType {
  AIRLINE_FEATURES = 'airline_features',    // "Does AA have seat selection?"
  FEATURE_AIRLINES = 'feature_airlines',    // "Which airlines support dynamic pricing?"
  COMPARISON = 'comparison',                // "Compare baggage options across airlines"
  STATUS_QUERY = 'status_query',           // "What features are in pilot status?"
  PROVIDER_QUERY = 'provider_query',       // "List Sabre airlines"
  GENERAL = 'general'                      // General or unclear queries
}

export class QueryParserService {
  private dbService: DatabaseService;
  private airlinePatterns: Map<string, string[]> = new Map();
  private featurePatterns: Map<string, string[]> = new Map();

  constructor(dbService: DatabaseService) {
    this.dbService = dbService;
    this.initializePatterns();
  }

  private initializePatterns() {
    // Airline code patterns and aliases
    this.airlinePatterns.set('american', ['aa', 'american airlines', 'american']);
    this.airlinePatterns.set('delta', ['dl', 'delta air lines', 'delta airlines', 'delta']);
    this.airlinePatterns.set('united', ['ua', 'united airlines', 'united']);
    this.airlinePatterns.set('lufthansa', ['lh', 'lufthansa group', 'lufthansa', 'austrian', 'os', 'brussels', 'sn', 'swiss', 'lx']);
    this.airlinePatterns.set('british', ['ba', 'british airways', 'british']);

    // Feature patterns and synonyms
    this.featurePatterns.set('dynamic pricing', ['dynamic pricing', 'pricing', 'price', 'dynamic price', 'fare pricing']);
    this.featurePatterns.set('seat selection', ['seat selection', 'seat', 'seats', 'seating', 'choose seat']);
    this.featurePatterns.set('baggage options', ['baggage', 'bags', 'luggage', 'baggage options', 'checked bags']);
    this.featurePatterns.set('unaccompanied minors', ['unaccompanied minors', 'minors', 'children', 'kids', 'unaccompanied', 'minor']);
    this.featurePatterns.set('pet transportation', ['pet', 'pets', 'animals', 'pet transport', 'pet travel']);
    this.featurePatterns.set('group bookings', ['group', 'groups', 'group booking', 'bulk booking']);
    this.featurePatterns.set('multi-passenger booking', ['multi-passenger', 'multiple passengers', 'multiple people']);
    this.featurePatterns.set('online check-in', ['check-in', 'checkin', 'online checkin', 'web checkin']);
    this.featurePatterns.set('corporate payment', ['corporate', 'business payment', 'corporate billing']);
  }

  /**
   * Parse a user query to extract entities and determine query type
   */
  async parseQuery(query: string): Promise<QueryEntities> {
    const lowerQuery = query.toLowerCase();
    
    // Extract entities
    const airlines = this.extractAirlines(lowerQuery);
    const features = this.extractFeatures(lowerQuery);
    const statuses = this.extractStatuses(lowerQuery);
    const categories = this.extractCategories(lowerQuery);
    const providers = this.extractProviders(lowerQuery);
    
    // Determine query type and confidence
    const { queryType, confidence } = this.determineQueryType(lowerQuery, airlines, features);

    return {
      airlines,
      features,
      statuses,
      categories,
      providers,
      queryType,
      confidence
    };
  }

  /**
   * Extract airline references from query
   */
  private extractAirlines(query: string): string[] {
    const foundAirlines: string[] = [];
    
    for (const [airlineName, patterns] of this.airlinePatterns) {
      for (const pattern of patterns) {
        if (query.includes(pattern)) {
          foundAirlines.push(airlineName);
          break; // Found this airline, move to next
        }
      }
    }
    
    return [...new Set(foundAirlines)]; // Remove duplicates
  }

  /**
   * Extract feature references from query
   */
  private extractFeatures(query: string): string[] {
    const foundFeatures: string[] = [];
    
    for (const [featureName, patterns] of this.featurePatterns) {
      for (const pattern of patterns) {
        if (query.includes(pattern)) {
          foundFeatures.push(featureName);
          break; // Found this feature, move to next
        }
      }
    }
    
    return [...new Set(foundFeatures)]; // Remove duplicates
  }

  /**
   * Extract status references from query
   */
  private extractStatuses(query: string): string[] {
    const statuses: string[] = [];
    const statusPatterns = {
      'yes': ['yes', 'supported', 'available', 'support', 'have', 'offer'],
      'no': ['no', 'not supported', 'unavailable', 'dont have', 'not available'],
      'limited': ['limited', 'partial', 'some', 'restricted'],
      'pilot': ['pilot', 'testing', 'test', 'trial', 'beta'],
      'production': ['production', 'live', 'active', 'ready'],
      'development': ['development', 'dev', 'developing', 'in progress']
    };

    for (const [status, patterns] of Object.entries(statusPatterns)) {
      for (const pattern of patterns) {
        if (query.includes(pattern)) {
          statuses.push(status);
          break;
        }
      }
    }

    return [...new Set(statuses)];
  }

  /**
   * Extract category references from query
   */
  private extractCategories(query: string): string[] {
    const categories: string[] = [];
    const categoryPatterns = {
      'shopping': ['shopping', 'search', 'pricing', 'fare'],
      'booking': ['booking', 'reservation', 'book'],
      'servicing': ['servicing', 'service', 'check-in', 'checkin'],
      'payment': ['payment', 'billing', 'pay'],
      'global': ['global', 'international']
    };

    for (const [category, patterns] of Object.entries(categoryPatterns)) {
      for (const pattern of patterns) {
        if (query.includes(pattern)) {
          categories.push(category);
          break;
        }
      }
    }

    return [...new Set(categories)];
  }

  /**
   * Extract provider references from query
   */
  private extractProviders(query: string): string[] {
    const providers: string[] = [];
    const providerPatterns = {
      'sabre': ['sabre'],
      'amadeus': ['amadeus'],
      'altea': ['altea', 'altea ndc'],
      'accelya': ['accelya', 'farelogix']
    };

    for (const [provider, patterns] of Object.entries(providerPatterns)) {
      for (const pattern of patterns) {
        if (query.includes(pattern)) {
          providers.push(provider);
          break;
        }
      }
    }

    return [...new Set(providers)];
  }

  /**
   * Determine the type of query and confidence level
   */
  private determineQueryType(query: string, airlines: string[], features: string[]): { queryType: QueryType, confidence: number } {
    let confidence = 0.5; // Base confidence
    
    // Pattern matching for query types
    if (query.includes('which airlines') || query.includes('what airlines')) {
      confidence = 0.9;
      return { queryType: QueryType.FEATURE_AIRLINES, confidence };
    }

    if (query.includes('does') && airlines.length > 0) {
      confidence = 0.85;
      return { queryType: QueryType.AIRLINE_FEATURES, confidence };
    }

    if (query.includes('compare') || query.includes('comparison')) {
      confidence = 0.8;
      return { queryType: QueryType.COMPARISON, confidence };
    }

    if (query.includes('status') || query.includes('pilot') || query.includes('production')) {
      confidence = 0.8;
      return { queryType: QueryType.STATUS_QUERY, confidence };
    }

    if (query.includes('provider') || query.includes('sabre') || query.includes('amadeus')) {
      confidence = 0.8;
      return { queryType: QueryType.PROVIDER_QUERY, confidence };
    }

    // Inference based on entities found
    if (airlines.length > 0 && features.length > 0) {
      confidence = 0.7;
      return { queryType: QueryType.AIRLINE_FEATURES, confidence };
    }

    if (features.length > 0 && airlines.length === 0) {
      confidence = 0.7;
      return { queryType: QueryType.FEATURE_AIRLINES, confidence };
    }

    if (airlines.length > 1) {
      confidence = 0.6;
      return { queryType: QueryType.COMPARISON, confidence };
    }

    return { queryType: QueryType.GENERAL, confidence: 0.3 };
  }

  /**
   * Build optimized context based on parsed entities
   */
  async buildOptimizedContext(entities: QueryEntities): Promise<any[]> {
    const context: any[] = [];

    try {
      // Always include basic reference data (but limited)
      const allAirlines = await this.dbService.getAllAirlines();
      const allFeatures = await this.dbService.getAllFeatures();
      
      // Create lookup maps for enriching implementations
      const airlineMap = new Map(allAirlines.map(a => [a.id, a]));
      const featureMap = new Map(allFeatures.map(f => [f.id, f]));

      // Filter airlines if specific ones mentioned
      let relevantAirlines = allAirlines;
      if (entities.airlines.length > 0) {
        relevantAirlines = allAirlines.filter(airline => 
          entities.airlines.some(entityAirline => 
            airline.name.toLowerCase().includes(entityAirline) ||
            airline.codes.toLowerCase().includes(entityAirline.toUpperCase())
          )
        );
      }

      // Filter features if specific ones mentioned  
      let relevantFeatures = allFeatures;
      if (entities.features.length > 0) {
        relevantFeatures = allFeatures.filter(feature =>
          entities.features.some(entityFeature =>
            feature.name.toLowerCase().includes(entityFeature) ||
            entityFeature.includes(feature.name.toLowerCase())
          )
        );
      }

      // Get targeted implementations based on query type
      let implementations: any[] = [];
      
      switch (entities.queryType) {
        case QueryType.AIRLINE_FEATURES:
          // Specific airline(s) + specific feature(s)
          implementations = await this.getImplementationsByAirlinesAndFeatures(
            relevantAirlines.map(a => a.id), 
            relevantFeatures.map(f => f.id)
          );
          break;
          
        case QueryType.FEATURE_AIRLINES:
          // All airlines for specific feature(s)
          if (relevantFeatures.length > 0) {
            implementations = await this.getImplementationsByFeatures(
              relevantFeatures.map(f => f.id)
            );
          }
          break;
          
        case QueryType.COMPARISON:
          // Multiple airlines, potentially specific features
          implementations = await this.getImplementationsForComparison(
            relevantAirlines.map(a => a.id),
            relevantFeatures.map(f => f.id)
          );
          break;
          
        case QueryType.STATUS_QUERY:
          // Filter by status
          implementations = await this.getImplementationsByStatus(entities.statuses);
          break;
          
        case QueryType.PROVIDER_QUERY:
          // Filter by provider
          const providerAirlines = relevantAirlines.filter(airline =>
            entities.providers.some(provider =>
              airline.provider.toLowerCase().includes(provider)
            )
          );
          implementations = await this.getImplementationsByAirlines(
            providerAirlines.map(a => a.id)
          );
          break;
          
        default:
          // General query - get a sample of implementations
          const allImplementations = await this.dbService.getAllImplementations();
          implementations = allImplementations.slice(0, 10);
      }

      // Enrich implementations with airline and feature details
      const enrichedImplementations = implementations.map(impl => ({
        ...impl,
        airline_name: airlineMap.get(impl.airline_id)?.name || `Unknown Airline (ID: ${impl.airline_id})`,
        airline_codes: airlineMap.get(impl.airline_id)?.codes || 'Unknown',
        airline_provider: airlineMap.get(impl.airline_id)?.provider || 'Unknown',
        airline_status: airlineMap.get(impl.airline_id)?.status || 'Unknown',
        feature_name: featureMap.get(impl.feature_id)?.name || `Unknown Feature (ID: ${impl.feature_id})`,
        feature_category: featureMap.get(impl.feature_id)?.category || 'Unknown',
        feature_description: featureMap.get(impl.feature_id)?.description || 'No description'
      }));

      // Build context with enriched data
      if (enrichedImplementations.length > 0) {
        context.push(...enrichedImplementations);
      }

      // Add reference data (still useful for general context)
      context.push({ airlines: relevantAirlines });
      context.push({ features: relevantFeatures });

    } catch (error) {
      console.error('Error building optimized context:', error);
      // Fallback to basic context
      const airlines = await this.dbService.getAllAirlines();
      const features = await this.dbService.getAllFeatures();
      context.push({ airlines: airlines.slice(0, 5) });
      context.push({ features: features.slice(0, 5) });
    }

    return context;
  }

  // Helper methods for targeted database queries
  private async getImplementationsByAirlinesAndFeatures(airlineIds: number[], featureIds: number[]): Promise<any[]> {
    if (airlineIds.length === 0 || featureIds.length === 0) return [];
    
    const allImplementations = await this.dbService.getAllImplementations();
    return allImplementations.filter(impl => 
      airlineIds.includes(impl.airline_id) && featureIds.includes(impl.feature_id)
    );
  }

  private async getImplementationsByFeatures(featureIds: number[]): Promise<any[]> {
    if (featureIds.length === 0) return [];
    
    const allImplementations = await this.dbService.getAllImplementations();
    return allImplementations.filter(impl => featureIds.includes(impl.feature_id));
  }

  private async getImplementationsForComparison(airlineIds: number[], featureIds: number[]): Promise<any[]> {
    const allImplementations = await this.dbService.getAllImplementations();
    
    if (featureIds.length > 0) {
      return allImplementations.filter(impl => featureIds.includes(impl.feature_id));
    } else if (airlineIds.length > 0) {
      return allImplementations.filter(impl => airlineIds.includes(impl.airline_id));
    }
    
    return allImplementations.slice(0, 15); // Limited sample for general comparison
  }

  private async getImplementationsByStatus(statuses: string[]): Promise<any[]> {
    if (statuses.length === 0) return [];
    
    const allImplementations = await this.dbService.getAllImplementations();
    return allImplementations.filter(impl => 
      statuses.some(status => impl.value.toLowerCase().includes(status))
    );
  }

  private async getImplementationsByAirlines(airlineIds: number[]): Promise<any[]> {
    if (airlineIds.length === 0) return [];
    
    const allImplementations = await this.dbService.getAllImplementations();
    return allImplementations.filter(impl => airlineIds.includes(impl.airline_id));
  }
}