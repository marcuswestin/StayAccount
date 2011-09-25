#import <Foundation/Foundation.h>
#import "FMDatabase.h"

@interface Storage : NSObject {
    FMDatabase* database;
}

+ (id) open;
- (void) addInterval:(NSInteger*)startTime duration:(NSInteger*)duration activityID:(NSInteger*)activityID;

@end
