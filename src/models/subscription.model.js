import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    Subscriber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

// USER -->   Subscription -->  for Subscribers will find channels not user
//      -->    channel  --> for Subscribers's value from Subscription will tah c(subscriber) has subscribe that channel or not && from this will be get how many channels c follows
//channel se Subscribers milta hai && Subscribers se channel