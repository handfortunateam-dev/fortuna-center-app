LiveBroadcasts

bookmark_border

content_copy

Spark icon
AI-generated Key Takeaways
The API now supports the ability to mark your live broadcasts as "made for kids," and the liveBroadcast resource now contains a property that identifies the "made for kids" status of that live broadcast. The YouTube API Services Terms of Service and Developer Policies were also updated on 10 January 2020. For more information, see the revision histories for the YouTube Live Streaming API Service and the YouTube API Services Terms of Service.
A liveBroadcast resource represents an event that will be streamed, using live video, on YouTube.

Methods
The API supports the following methods for liveBroadcasts resources:

list
Returns a list of YouTube broadcasts that match the API request parameters. Try it now.
insert
Creates a broadcast. Try it now.
update
Updates a broadcast. For example, you could modify the broadcast settings defined in the liveBroadcast resource's contentDetails object. Try it now.
delete
Deletes a broadcast. Try it now.
bind
Binds a YouTube broadcast to a stream or removes an existing binding between a broadcast and a stream. A broadcast can only be bound to one video stream, though a video stream may be bound to more than one broadcast. Try it now.
transition
Changes the status of a YouTube live broadcast and initiates any processes associated with the new status. For example, when you transition a broadcast's status to testing, YouTube starts to transmit video to that broadcast's monitor stream. Before calling this method, you should confirm that the value of the status.streamStatus property for the stream bound to your broadcast is active. Try it now.
cuepoint
Inserts a cuepoint into a live broadcast. The cuepoint might trigger an ad break.
Resource representation
The following JSON structure shows the format of a liveBroadcasts resource:


{
  "kind": "youtube#liveBroadcast",
  "etag": etag,
  "id": string,
  "snippet": {
    "publishedAt": datetime,
    "channelId": string,
    "title": string,
    "description": string,
    "thumbnails": {
      (key): {
        "url": string,
        "width": unsigned integer,
        "height": unsigned integer
      }
    },
    "scheduledStartTime": datetime,
    "scheduledEndTime": datetime,
    "actualStartTime": datetime,
    "actualEndTime": datetime,
    "isDefaultBroadcast": boolean,
    "liveChatId": string
  },
  "status": {
    "lifeCycleStatus": string,
    "privacyStatus": string,
    "recordingStatus": string,
    "madeForKids": string,
    "selfDeclaredMadeForKids": string,
  },
  "contentDetails": {
    "boundStreamId": string,
    "boundStreamLastUpdateTimeMs": datetime,
    "monitorStream": {
      "enableMonitorStream": boolean,
      "broadcastStreamDelayMs": unsigned integer,
      "embedHtml": string
    },
    "enableEmbed": boolean,
    "enableDvr": boolean,
    "recordFromStart": boolean,
    "enableClosedCaptions": boolean,
    "closedCaptionsType": string,
    "projection": string,
    "enableLowLatency": boolean,
    "latencyPreference": boolean,
    "enableAutoStart": boolean,
    "enableAutoStop": boolean
  },
  "statistics": {
    "totalChatCount": unsigned long
  },
  "monetizationDetails": {
      "cuepointSchedule": {
        "enabled": boolean,
        "pauseAdsUntil": datetime,
        "scheduleStrategy": string,
        "repeatIntervalSecs": unsigned integer,
      }
    }
  }
}
Properties
The following table defines the properties that appear in this resource:

Properties
kind	string
Identifies the API resource's type. The value will be youtube#liveBroadcast.
etag	etag
The Etag of this resource.
id	string
The ID that YouTube assigns to uniquely identify the broadcast.
snippet	object
The snippet object contains basic details about the event, including its title, description, start time, and end time.
snippet.publishedAt	datetime
The date and time that the broadcast was added to YouTube's live broadcast schedule. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format.
snippet.channelId	string
The ID that YouTube uses to uniquely identify the channel that is publishing the broadcast.
snippet.title	string
The broadcast's title. Note that the broadcast represents exactly one YouTube video. You can set this field by modifying the broadcast resource or by setting the title field of the corresponding video resource.
snippet.description	string
The broadcast's description. As with the title, you can set this field by modifying the broadcast resource or by setting the description field of the corresponding video resource.
snippet.thumbnails	object
A map of thumbnail images associated with the broadcast. For each nested object in this object, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
snippet.thumbnails.(key)	object
Valid key values are:
default – The default thumbnail image. The default thumbnail for a video – or a resource that refers to a video, such as a playlist item or search result – is 120px wide and 90px tall. The default thumbnail for a channel is 88px wide and 88px tall.
medium – A higher resolution version of the thumbnail image. For a video (or a resource that refers to a video), this image is 320px wide and 180px tall. For a channel, this image is 240px wide and 240px tall.
high – A high resolution version of the thumbnail image. For a video (or a resource that refers to a video), this image is 480px wide and 360px tall. For a channel, this image is 800px wide and 800px tall.
snippet.thumbnails.(key).url	string
The image's URL.
snippet.thumbnails.(key).width	unsigned integer
The image's width.
snippet.thumbnails.(key).height	unsigned integer
The image's height.
snippet.scheduledStartTime	datetime
The date and time that the broadcast is scheduled to start. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. Creator Studio supports the ability to create a broadcast without scheduling a start time. In this case, the broadcast starts whenever the channel owner starts streaming. For these broadcasts, the datetime value corresponds to Unix epoch time zero, and this value cannot be changed using the API or in Creator Studio.
snippet.scheduledEndTime	datetime
The date and time that the broadcast is scheduled to end. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. If a liveBroadcast resource does not specify a value for this property, then the broadcast is scheduled to continue indefinitely. Similarly, if you don't specify a value for this property, then YouTube treats the broadcast as if it will go on indefinitely.
snippet.actualStartTime	datetime
The date and time that the broadcast actually started. This information is only available once the broadcast's state is live. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format.
snippet.actualEndTime	datetime
The date and time that the broadcast actually ended. This information is only available once the broadcast's state is complete. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format.
snippet.isDefaultBroadcast	boolean
This property will be deprecated on or after September 1, 2020. At that time, YouTube will stop creating a default stream and default broadcast when a channel is enabled for live streaming. See the deprecation announcement for more details.
This property indicates whether this broadcast is the default broadcast.

How default broadcasts work

When a YouTube channel is enabled for live streaming, YouTube creates a default stream and a default broadcast for the channel. The stream defines how the channel owner sends live video to YouTube, and the broadcast is how viewers can see the default stream. A channel owner can use the liveStreams.list and liveBroadcasts.list methods to identify these resources.

When a channel starts streaming video to its default stream, the video is visible on the channel's default broadcast. When the stream ends, YouTube converts the completed broadcast to a YouTube video and assigns the video a YouTube video ID.

After the conversion is complete, the video is included in the channel's list of uploaded videos. The video is not available immediately after the broadcast concludes, and the length of the delay is related to the actual length of the broadcast.
snippet.liveChatId	string
The ID for the broadcast's YouTube live chat. With this ID, you can use the liveChatMessage resource's methods to retrieve, insert, or delete chat messages. You can also add or remove chat moderators, ban users from participating in live chats, or remove existing bans.
status	object
The status object contains information about the event's status.
status.lifeCycleStatus	string
The broadcast's status. The status can be updated using the API's liveBroadcasts.transition method.

Valid values for this property are:
complete – The broadcast is finished.
created – The broadcast has incomplete settings, so it is not ready to transition to a live or testing status, but it has been created and is otherwise valid.
live – The broadcast is active.
liveStarting – The broadcast is in the process of transitioning to live status.
ready – The broadcast settings are complete and the broadcast can transition to a live or testing status.
revoked – This broadcast was removed by an administrator action.
testStarting – The broadcast is in the process of transitioning to testing status.
testing – The broadcast is only visible to the partner.
status.privacyStatus	string
The broadcast's privacy status. Note that the broadcast represents exactly one YouTube video, so the privacy settings are identical to those supported for videos. In addition, you can set this field by modifying the broadcast resource or by setting the privacyStatus field of the corresponding video resource.

Valid values for this property are:
private
public
unlisted
status.recordingStatus	string
The broadcast's recording status.

Valid values for this property are:
notRecording
recorded
recording
status.madeForKids	boolean
This value indicates whether the broadcast is designated as child-directed. This property value is read-only.
status.selfDeclaredMadeForKids	boolean
In a liveBroadcasts.insert request, this property allows the channel owner to designate the broadcast as being child-directed. In a liveBroadcasts.list request, the property value is only returned if the channel owner authorized the API request.
contentDetails	object
The contentDetails object contains information about the event's video content, such as whether the content can be shown in an embedded video player or if it will be archived and therefore available for viewing after the event has concluded.
contentDetails.boundStreamId	string
This value uniquely identifies the live stream bound to the broadcast.
contentDetails.boundStreamLastUpdateTimeMs	datetime
The date and time that the livestream referenced by boundStreamId was last updated.
contentDetails.monitorStream	object
The monitorStream object contains information about the monitor stream, which the broadcaster can use to review the event content before the broadcast stream is shown publicly.
contentDetails.monitorStream.enableMonitorStream	boolean
This value determines whether the monitor stream is enabled for the broadcast. If the monitor stream is enabled, then YouTube will broadcast the event content on a special stream intended only for the broadcaster's consumption. The broadcaster can use the stream to review the event content and also to identify the optimal times to insert cuepoints.

You need to set this value to true if you intend to have a testing stage for your broadcast or if you want to have a broadcast delay for your event. In addition, if this property's value is true, then you must transition your broadcast to the testing state before you can transition it to the live state. (If the property's value is false, your broadcast cannot have a testing stage, so you can transition the broadcast directly to the live state.)

When you update a broadcast, this property must be set if your API request includes the contentDetails part in the part parameter value. However, when you insert a broadcast, the property is optional and has a default value of true.

Important: This property cannot be updated once the broadcast is in the testing or live state.
contentDetails.monitorStream.broadcastStreamDelayMs	unsigned integer
If you have set the enableMonitorStream property to true, then this property determines the length of the live broadcast delay.

When you update a broadcast, this property must be set if your API request includes the contentDetails part in the part parameter value. However, when you insert a broadcast, the property is optional and has a default value of 0. This value indicates that the broadcast does not have a broadcast delay. Note: This property cannot be updated once the broadcast is in the testing or live state.
contentDetails.monitorStream.embedHtml	string
HTML code that embeds a player that plays the monitor stream.
contentDetails.enableEmbed	boolean
This setting indicates whether the broadcast video can be played in an embedded player. If you choose to archive the video (using the enableArchive property), this setting will also apply to the archived video.

When you update a broadcast, this property must be set if your API request includes the contentDetails part in the part parameter value. However, when you insert a broadcast, the property is optional and has a default value of true.

Note: This property cannot be updated once the broadcast is in the testing or live state.
contentDetails.enableDvr	boolean
This setting determines whether viewers can access DVR controls while watching the video. DVR controls enable the viewer to control the video playback experience by pausing, rewinding, or fast forwarding content. The default value for this property is true.

When you update a broadcast, this property must be set if your API request includes the contentDetails part in the part parameter value. However, when you insert a broadcast, the property is optional and has a default value of true.

Important: You must set the value to true and also set the enableArchive property's value to true if you want to make playback available immediately after the broadcast ends. In addition, this property cannot be updated once the broadcast is in the testing or live state.
contentDetails.recordFromStart	boolean
This setting indicates whether YouTube will automatically start recording the broadcast after the event's status changes to live.

This property's default value is true, and it can only be set to false if the broadcasting channel is allowed to disable recordings for live broadcasts.

If your channel does not have permission to disable recordings, and you attempt to insert a broadcast with the recordFromStart property set to false, the API will return a Forbidden error. In addition, if your channel does not have that permission and you attempt to update a broadcast to set the recordFromStart property to false, the API will return a modificationNotAllowed error.

When you update a broadcast, this property must be set if your API request includes the contentDetails part in the part parameter value. However, when you insert a broadcast, the property is optional and has a default value of true.

Important: You must also set the enableDvr property's value to true if you want the playback to be available immediately after the broadcast ends. If you set this property's value to true but don't also set the enableDvr property to true, there may be a delay of around one day before the archived video will be available for playback.

Note: This property cannot be updated once the broadcast is in the testing or live state.
contentDetails.enableClosedCaptions	boolean
This property has been deprecated as of December 17, 2015. Use the contentDetails.closedCaptionsType property instead.

This setting indicates whether HTTP POST closed captioning is enabled for this broadcast. For API clients that are already using this property:
Setting the property value to true is equivalent to setting the contentDetails.closedCaptionsType property to closedCaptionsHttpPost.
Setting the property value to false is equivalent to setting the contentDetails.closedCaptionsType property to closedCaptionsDisabled.
contentDetails.closedCaptionsType	string
Note: This property replaces the contentDetails.enableClosedCaptions property.

This property indicates whether closed captioning is enabled for your broadcast and, if so, what type of closed captions you are providing:
closedCaptionsDisabled: Closed captions are disabled for the live broadcast.
closedCaptionsHttpPost: You will send captions, using HTTP POST, to an ingestion URL associated with your livestream.
closedCaptionsEmbedded: Captions will be encoded in the video stream using EIA-608 and/or CEA-708 formats.
contentDetails.projection	string
The projection format of this broadcast. The property's default value is rectangular.

Valid values for this property are:
360
rectangular
contentDetails.enableLowLatency	boolean
Indicates whether this broadcast should be encoded for low-latency streaming. A low-latency stream can reduce the amount of time it takes for video to be visible to users watching a broadcast, though it can also impact the resolution for viewers of the stream.
contentDetails.latencyPreference	string
Indicates which latency setting to use for this broadcast. This property may be used instead of enableLowLatency, which does not support ultraLow.

A low-latency stream can reduce the amount of time it takes for video to be visible to users watching a broadcast, though it can also affect the smoothness of playback.

An ultra-low-latency stream further reduces the time it takes for video to be visible to viewers, making interaction with viewers easier, but ultra-low latency does not support closed captions, or resolutions higher than 1080p.

Valid values for this property are:
normal
low
ultraLow
contentDetails.enableAutoStart	boolean
Indicates whether this broadcast should start automatically when you start streaming video on the bound live stream.
contentDetails.enableAutoStop	boolean
Indicates whether this broadcast should stop automatically around one minute after the channel owner stops streaming video on the bound video stream.
statistics	object
The statistics object contains statistics related to a live broadcast. The values for these statistics can change during the broadcast and can only be retrieved while the broadcast is live.
statistics.totalChatCount	unsigned long
The total number of live chat messages associated with the broadcast. The property and its value are present if the broadcast is visible to the user, has the live chat feature enabled, and has at least one message. Note that this property won't specify a value after the broadcast ends. So, this property wouldn't identify the number of chat messages for an archived video of a completed live broadcast.
monetizationDetails	object
The monetizationDetails object contains information about the stream's monetization details, such as if the ads automator is turned on or if midroll ads insertion is delayed.

Important: To enable automated ads for a video, the channel must be eligible to monetize videos. The broadcast's monetization setting, such as turning on monetization or ads automator (i.e. "Let YouTube insert mid-rolls for you" or "Schedule mid-roll ads at a set frequency"), can be set in YouTube Studio when creating the broadcast or editing the broadcast during live.
monetizationDetails.cuepointSchedule	object
The cuepointSchedule object specifies the ad automation settings for the broadcast.
monetizationDetails.cuepointSchedule.enabled	boolean
This value determines whether ads are automatically inserted in the broadcast. If the value is true, YouTube will automatically insert midroll ads into the broadcast. The schedule for running ads will be determined by the value of the other fields in the monetizationDetails.cuepointSchedule object.
monetizationDetails.cuepointSchedule.pauseAdsUntil	datetime
This value specifies that YouTube shouldn't insert midroll ads into the broadcast until the specified date and time. The value is specified in ISO 8601 (YYYY-MM-DDThh:mm:ss.sZ) format. The value must be set to a future datetime to pause ads; the field value can also be set to a near future datetime to unpause ads when time passes.
monetizationDetails.cuepointSchedule.scheduleStrategy	string
This value specifies the strategy that YouTube should follow for scheduling cuepoints. Valid values are:
CONCURRENT: Cuepoints are scheduled at the same time for all viewers
NON_CONCURRENT: Cuepoints are scheduled at different times for different viewers. This approach enables ads to be shown at an increased rate that allows viewers to receive cuepoints when eligible.
monetizationDetails.cuepointSchedule.repeatIntervalSecs	unsigned integer
This value specifies the interval, in seconds, between automatic ad insertion during a broadcast. For example, if the value is 300, YouTube can insert midroll ad cuepoints at five minute intervals.

Note that the value specifies the time between the start of successive cuepoints. That is, the interval is not measured from the end of one cuepoint to the start of the next.