import { EventDatasource } from '@/datasource/event.datasource'
import { env, logger } from '@/context'
import { userRepository } from '@/repositories'

export function userEventListeners(eventDS: EventDatasource) {
  eventDS.subscribe( env.USER_REGISTRATION_LISTENER , async (msg) => {
    // Handle user registration event

    const userID = msg.data.id
    //create new user from the event
    }
    // return await userRepository.create(data)
  })


}