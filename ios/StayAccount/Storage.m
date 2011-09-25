#import "Storage.h"

@interface Storage (hidden)
-(id) initWithDatabase:(FMDatabase*)database;
-(void) createTables;
@end

@implementation Storage

+ (id) open {
    FMDatabase* db = [FMDatabase databaseWithPath:@"/tmp/storage.tmp"];
    if (![db open]) { return NULL; }
    return [[Storage alloc] initWithDatabase:db];
}

- (void) addInterval:(NSInteger *)startTime duration:(NSInteger *)duration activityID:(NSInteger *)activityID {
//    [database executeQuery:
}

@end

@implementation Storage (hidden)

-(id) initWithDatabase:(FMDatabase *)theDatabase {
    database = theDatabase;
    return self;
}

- (void) createTables {
    [database executeQuery:@""
     ""
        
    ];
}

@end