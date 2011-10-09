// TODO move this functionality into BlowTorch
#import "Storage.h"
#import "Request.h"

@interface Storage (hidden)
-(void) dumpBackup;
-(NSArray*) getDump;
+(NSString*) getPath:(NSString*)path;
@end

@implementation Storage

@synthesize database;

+ (id) open {
    NSString *dbPath = [self getPath:@"database.db"];
    
    FMDatabase* database = [FMDatabase databaseWithPath:dbPath];
    NSLog(@"Opening database %@", dbPath);
    
    if (![database open]) { return nil; }
    
    Storage* storage = [Storage alloc];
    storage.database = database;
    [storage dumpBackup];
    return storage;
}

+ (NSDictionary*) getDeviceInfo {
    NSString* path = [self getPath:@"deviceInfo.dict"];
    NSDictionary* deviceInfo = [NSDictionary dictionaryWithContentsOfFile:path];
    if (!deviceInfo) {
        CFUUIDRef theUUID = CFUUIDCreate(NULL);
        NSString* uuid = (__bridge NSString *) CFUUIDCreateString(NULL, theUUID);
        CFRelease(theUUID);
        deviceInfo = [NSDictionary dictionaryWithObject:uuid forKey:@"uuid"];
        [deviceInfo writeToFile:path atomically:YES];
    }
    return deviceInfo;
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

-(void) backup:(ResponseCallback)responseCallback {
    NSLog(@"Stashing data");
    NSArray* rows = [self getDump];
    NSString* uuid = [[Storage getDeviceInfo] objectForKey:@"uuid"];
    NSDictionary* params = [NSDictionary dictionaryWithObjectsAndKeys:uuid, @"uuid", rows, @"rows", nil];
    [Request post:@"/stash/" params:params callback:^(NSError *error, NSDictionary *response) {
        NSLog(@"Stash error:%@ response%@", error, response);
        if (error) { responseCallback([error domain], nil); }
        else { responseCallback(nil, response); }
    }];
}

@end

@implementation Storage (hidden)

-(void) dumpBackup {
    NSArray* intervalsList = [self getDump];
    NSString *docsDirectory = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    NSString *fileName = [NSString stringWithFormat:@"backup-%d.bak", (long)[[NSDate date] timeIntervalSince1970]];
    NSString *backupPath = [docsDirectory stringByAppendingPathComponent:fileName];
    
    NSLog(@"Backing up to %@", backupPath);
    [intervalsList writeToFile:backupPath atomically:YES];
}

-(NSArray*) getDump {
    FMResultSet* results = [database executeQuery:@"SELECT * FROM completed_intervals"];
    NSMutableArray* intervalsList = [[NSMutableArray alloc] init];
    while ([results next]) { [intervalsList addObject:[results resultDict]]; }
    return intervalsList;
}
                                
+ (NSString*) getPath:(NSString*)path {
    NSString *docsDirectory = [NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES) objectAtIndex:0];
    return [docsDirectory stringByAppendingPathComponent:path];
}
                                
@end