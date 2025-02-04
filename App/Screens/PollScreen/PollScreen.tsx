import React, { useState } from 'react'
import {
  Pressable,
  View,
  Image,
  Text,
  ScrollView,
  StatusBar
} from 'react-native'
import PollScreenStyles from './PollScreen.styles'
import { useNavigation } from '@react-navigation/native'
import { Separator, LoadingIndicator } from '../../Components'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState } from '../../Redux/Store'
import { answerAndGetPollPercentages } from '../../Services/Apis/Apis'
import { pollActions } from '../../Redux/Reducers/PollReducer'
import { PollSection } from './Components'
import {
  alertMessageWithAction,
  accessibilityAndTestProps
} from '../../Utils/Helpers'
import { accessibilityLabels, testIDs } from './AccessibilityAndTestIDs'

const PollScreen = () => {
  const [isLoading, setIsloading] = useState<boolean>(false)
  const [answersData, setAnswersData] = useState(null)
  const { goBack } = useNavigation()
  const { pollData } = useSelector((state: RootState) => state.poll)
  const dispatch = useDispatch()

  const handelAnswer = async (answer: string | null) => {
    setIsloading(true)
    try {
      const data = await answerAndGetPollPercentages(answer)
      if (data) {
        setAnswersData(data)
        dispatch(pollActions.setPollAnswers(data))
      }
    } catch (error) {
      alertMessageWithAction(
        'Faild to answer the poll',
        'Please try again',
        () => handelAnswer(answer)
      )
    }
    setIsloading(false)
  }

  const handleOnClose = () => {
    goBack()
  }

  const HeaderSection = () => (
    <>
      <Pressable
        style={PollScreenStyles.closeIconWrapper}
        onPress={handleOnClose}
        {...accessibilityAndTestProps(
          `${testIDs.PollScreen_dailyQuestion}`,
          'How often do you watch porn while masturbating?'
        )}
      >
        <Image
          source={require('../../Assets/Icons/ic_close_black.png')}
          style={PollScreenStyles.closeIcon}
        />
      </Pressable>
      <Separator dir="column" value={16} />
      <Text style={PollScreenStyles.pollQuestionText}>
        How often do you watch porn while masturbating?
      </Text>
    </>
  )

  const ResoposeSection = () => {
    const responses = `${(
      answersData || pollData
    )?.response_count?.toLocaleString()} responses`

    return (
      <View style={PollScreenStyles.responsesWrapper}>
        <Text
          style={PollScreenStyles.responsesText}
          {...accessibilityAndTestProps(
            `${testIDs.PollScreen_responses}`,
            responses
          )}
        >
          {responses}
        </Text>
        <Separator value={19} dir="column" />
        {!answersData && (
          <Text
            style={[
              PollScreenStyles.responsesText,
              PollScreenStyles.noAnswerText
            ]}
            onPress={() => handelAnswer(null)}
            {...accessibilityAndTestProps(
              `${testIDs.PollScreen_noAnswer}`,
              accessibilityLabels.no_answer
            )}
          >
            I don’t want to answer
          </Text>
        )}
      </View>
    )
  }

  return (
    <ScrollView
      nestedScrollEnabled={true}
      contentContainerStyle={PollScreenStyles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar barStyle="dark-content" />
      <View style={PollScreenStyles.container}>
        <HeaderSection />
        <Separator value={16} dir="column" />
        <PollSection
          answersOptions={pollData?.answers_options}
          answerStats={answersData?.answer_stats}
          handelAnswer={handelAnswer}
          totalAnswers={answersData?.response_count}
        />
        <Separator value={10} dir="column" />
        <ResoposeSection />
        {isLoading && <LoadingIndicator />}
      </View>
    </ScrollView>
  )
}

export default PollScreen
