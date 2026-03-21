export interface KafkaStreams {
  enable: boolean;
  topic_name: string;
  partitions: number;
  replication_factor: number;
}
