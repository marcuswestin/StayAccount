#import <Foundation/Foundation.h>
#import "FMDatabase.h"
#import "BlowTorch.h"

@interface Storage : NSObject

@property (nonatomic, strong) FMDatabase* database;

+ (id) open;
+ (NSDictionary*) getDeviceInfo;
- (void) handleSqlCommand:(NSDictionary*)data responseCallback:(ResponseCallback)responseCallback;
- (void) backup:(ResponseCallback)responseCallback;

@end
