<?php


require_once 'db_conn.php';


$user_id=@(int)base64_decode(@$_POST['uid']);

$range=(@(int)$_GET['range']>0 )? ((@(int)$_GET['range'])/100):0;


  $query="SELECT levels.LevelID,
	levels.LevelMap, levels.LevelCode,
	levels.LevelNo,s.SolutionHistory,
	
	( SELECT Count(*) FROM levels_solution where levels_solution.LevelCode=levels.LevelCode and levels_solution.UserId='{$user_id}' and levels_solution.UserId>0 ) as user_sol
FROM `levels` 
left join levels_solution s on (s.LevelCode=levels.LevelCode)
WHERE IsBlocked=0 and LevelNo>=((SELECT Max(LevelNo) FROM `levels` WHERE levels.IsBlocked=0)*".$range.")
Order by levels.LevelNo  limit 50";

	$result = $mysqli->query($query) ;
$html='';	
	if ($result	&& $result->num_rows>0) {		
		
		while($row=$result->fetch_array()) {
			
			$user_check_icon='';
			$has_solution='';
			
			if ((int)$row['user_sol']>0)
				$user_check_icon='<figure class="user_level_check" ></figure> ';
			
			if (strlen( $row['SolutionHistory'])>2)
				$has_solution='<figure class="has_solution"></figure> ';
			
			
			$html .='<div class="level" level-id="'.$row['LevelID'].'"><header><strong class="level_select" level-id="'.$row['LevelID'].'">Level '.$row['LevelNo'].'</strong>'.$user_check_icon.$has_solution.'<figure class="user_level_prev_down"></figure> '.'</header><ul level-id="'.$row['LevelID'].'" class="level_preview level_select"><li>';
			
			$row_l=str_replace(' ','|',$row['LevelMap']);
			$row_l =str_replace('|','<span class="empty"></span>',$row_l);
			$row_l =str_replace('!','</li><li>',$row_l);
			$row_l =str_replace('x','<span class="space"></span>',$row_l);
			$row_l =str_replace('#','<span class="wall"></span>',$row_l);
			$row_l =str_replace('$','<span class="crate"></span>',$row_l);
			$row_l =str_replace('.','<span class="spot"></span>',$row_l);
			$row_l =str_replace('+','<span class="player"></span>',$row_l);
			$row_l =str_replace('@','<span class="player"></span>',$row_l);
			$row_l =str_replace('*','<span class="crate_spot"></span>',$row_l);
			
			
			$html .= $row_l.'</li></ul></div>';
		}
	}

print $html;
?>