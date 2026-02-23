
CREATE OR REPLACE FUNCTION public.get_or_create_daily_challenge(p_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(id uuid, challenge_date date, text_content text, target_wpm integer, target_accuracy numeric, reward_points integer, challenge_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_challenge_id UUID;
  v_text_content TEXT;
  v_target_wpm INTEGER;
  v_target_accuracy NUMERIC;
  v_reward_points INTEGER;
  v_texts TEXT[];
  v_index INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN QUERY
  SELECT dc.id, dc.challenge_date, dc.text_content, dc.target_wpm, 
         dc.target_accuracy, dc.reward_points, dc.challenge_type
  FROM daily_challenges dc
  WHERE dc.challenge_date = p_date
  LIMIT 1;
  
  IF FOUND THEN
    RETURN;
  END IF;
  
  IF p_date < CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot create challenges for past dates';
  END IF;
  
  IF p_date > CURRENT_DATE + INTERVAL '7 days' THEN
    RAISE EXCEPTION 'Cannot create challenges more than 7 days in advance';
  END IF;
  
  v_texts := ARRAY[
    'The ability to type quickly and accurately is an essential skill in the modern digital world where communication happens at the speed of light.',
    'Practice makes perfect and the more you type the better you become at expressing your thoughts through the keyboard with speed and precision.',
    'Every great journey begins with a single step and every fast typist started by learning the home row keys before building up their speed.',
    'Technology continues to evolve at a rapid pace and those who can keep up with their typing skills will always have an advantage in the workplace.',
    'The secret to becoming a better typist is consistency and dedication to daily practice sessions that challenge your current abilities.',
    'Good typing habits include keeping your fingers on the home row maintaining proper posture and looking at the screen instead of the keyboard.',
    'In a world where remote work is becoming the norm strong typing skills can make the difference between productivity and frustration.',
    'Learning to type without looking at the keyboard is called touch typing and it is one of the most valuable skills you can develop.',
    'Speed and accuracy go hand in hand when it comes to typing and finding the right balance between the two is key to improvement.',
    'The best typists in the world can exceed two hundred words per minute but even reaching sixty words per minute is a great achievement.',
    'Digital communication has transformed how we interact with each other and typing remains the primary way we express ourselves online.',
    'Focus and concentration are essential when practicing your typing skills as distractions can lead to more errors and slower speeds.',
    'Building muscle memory for common letter combinations will help you type faster without having to think about each individual keystroke.',
    'Regular typing practice helps strengthen the neural pathways between your brain and fingers making the process more automatic over time.',
    'Challenge yourself to type a little faster each day and you will be amazed at how much progress you can make in just a few weeks.'
  ];
  
  -- Use date-based index for deterministic but varied selection
  v_index := (EXTRACT(DOY FROM p_date)::integer % array_length(v_texts, 1)) + 1;
  v_text_content := v_texts[v_index];
  
  v_target_wpm := 30 + (floor(random() * 3) * 10)::integer;
  v_target_accuracy := 90 + (floor(random() * 3) * 2.5);
  v_reward_points := CASE 
    WHEN v_target_wpm >= 50 THEN 25
    WHEN v_target_wpm >= 40 THEN 15
    ELSE 10
  END;
  
  INSERT INTO daily_challenges (challenge_date, text_content, target_wpm, target_accuracy, reward_points, challenge_type)
  VALUES (p_date, v_text_content, v_target_wpm, v_target_accuracy, v_reward_points, 'standard')
  ON CONFLICT (challenge_date) DO NOTHING
  RETURNING daily_challenges.id INTO v_challenge_id;
  
  RETURN QUERY
  SELECT dc.id, dc.challenge_date, dc.text_content, dc.target_wpm, 
         dc.target_accuracy, dc.reward_points, dc.challenge_type
  FROM daily_challenges dc
  WHERE dc.challenge_date = p_date
  LIMIT 1;
END;
$function$;
