#import <Foundation/Foundation.h>

typedef void (^RequestResponseHandler)(NSError* error, NSDictionary* response);

@interface Request : NSObject

+(void) setURLBase:(NSString*)urlBase;
+(void) post:(NSString*)path params:(NSDictionary*)params callback:(RequestResponseHandler)callback;

@end
