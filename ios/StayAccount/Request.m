#import "Request.h"
#import "ASIFormDataRequest.h"
#import "JSONKit.h"

@interface Request (hidden)

-(void) post:(NSURL*)url params:(NSDictionary*)params callback:(RequestResponseHandler)callback;

@end

@implementation Request

static NSString* urlBase;

+(void) setURLBase:(NSString*)aUrlBase {
    urlBase = aUrlBase;
}

+(void) post:(NSString*)path params:(NSDictionary*)params callback:(RequestResponseHandler)callback {
    [[[Request alloc] init] post:[NSURL URLWithString:[urlBase stringByAppendingString:path]] params:params callback:callback];
}

@end

@implementation Request (hidden)

-(void) post:(NSURL *)url params:(NSDictionary *)params callback:(RequestResponseHandler)callback {
    __weak ASIFormDataRequest *request = [ASIFormDataRequest requestWithURL:url];
    [request setCompletionBlock:^{
        if ([request error]) { callback([request error], nil); }
        else { callback(nil, [[request responseData] objectFromJSONData]); }
    }];
    [request setFailedBlock:^{
        callback([request error], nil);
    }];
    [request addRequestHeader:@"User-Agent" value:@"StayAccount/a1"];
    [request setRequestMethod:@"POST"];
    [request setTimeOutSeconds:20];
    [request setPostBody:[NSMutableData dataWithData:[params JSONData]]];
    [request startAsynchronous];
}

@end