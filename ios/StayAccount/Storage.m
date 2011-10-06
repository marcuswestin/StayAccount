// TODO move this functionality into BlowTorch
#import "Storage.h"

@interface Storage (hidden)
-(void) dumpBackup;
@end

@implementation Storage

@synthesize database;

+ (id) open {
    NSString *docsDirectory = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString *dbPath = [docsDirectory stringByAppendingPathComponent:@"database.db"];
    
    FMDatabase* database = [FMDatabase databaseWithPath:dbPath];
    NSLog(@"Opening database %@", dbPath);
    
    if (![database open]) { return nil; }

    Storage* storage = [Storage alloc];
    storage.database = database;
    [storage dumpBackup];
    return storage;
}

- (void) handleSqlCommand:(NSDictionary *)data responseCallback:(ResponseCallback)responseCallback {
    if ([data objectForKey:@"getSchema"]) {
		// TODO Move this into a JS ORM layer
        NSString* filePath = [[NSBundle mainBundle] pathForResource:@"schema" ofType:@"sql"];
        NSString* schema = [NSString stringWithContentsOfFile:filePath encoding:NSASCIIStringEncoding error:nil];
        responseCallback(nil, [NSDictionary dictionaryWithObject:schema forKey:@"schema"]);
    } else if ([data objectForKey:@"query"]) { 
        FMResultSet* resultSet = [database executeQuery:[data objectForKey:@"query"]];
        if ([database hadError]) { return responseCallback([database lastErrorMessage], nil); }
        NSMutableArray* results = [NSMutableArray arrayWithCapacity:[resultSet columnCount]];
        while ([resultSet next]) {
            [results addObject:[resultSet resultDict]];
        }
        responseCallback(nil, [NSDictionary dictionaryWithObject:results forKey:@"results"]);
    } else if ([data objectForKey:@"update"]) {
        NSArray* updates = [[data objectForKey:@"update"] componentsSeparatedByString:@";"];
        BOOL success;
        if (updates.count == 1) {
            success = [database executeUpdate:[updates objectAtIndex:0]];
        } else {
            [database beginTransaction];
            for (NSString* update in updates) { [database executeUpdate:update]; }
            success = [database commit];
        }
        if (success) { responseCallback(nil, nil); }
        else { responseCallback([database lastErrorMessage], nil); }
    } else {
        NSLog(@"WARNING: Unrecognized Storage command %@", data);
    }
}

@end

@implementation Storage (hidden)

-(void) dumpBackup {
    FMResultSet* results = [database executeQuery:@"SELECT * FROM completed_intervals"];
    NSMutableArray* intervalsList = [[NSMutableArray alloc] init];
    while ([results next]) {
        [intervalsList addObject:[results resultDict]];
    }
    NSString *docsDirectory = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString *fileName = [NSString stringWithFormat:@"backup-%d.bak", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *backupPath = [docsDirectory stringByAppendingPathComponent:fileName];
    
    NSLog(@"Backing up to %@", backupPath);
    [intervalsList writeToFile:backupPath atomically:YES];
    
    NSLog(@"JSON: %@", [intervalsList JSONString]);
}

@end