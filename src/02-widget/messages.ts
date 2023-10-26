export interface HeightMessage {
  type: 'widget:height'
  height: number;
}

export interface ContentLoadedMessage {
  type: 'widget:content_loaded'
}