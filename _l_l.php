<?php 
if (isset($_POST['com_level_id']) && !empty($_POST['t']) 
	&& is_numeric($_POST['com_level_id']) ) {
	//secure token check

require_once 'db_conn.php';

if (@(int)$_POST['_l_mode']=='2' && !empty($_POST['clh']) && strlen($_POST['clh'])>0) {
	//If the level is complete, add the solution to the table
	
	$user_id=@(int)base64_decode(@$_POST['uid']);
	
	
	 $query="select levels.LevelCode,
	( SELECT Count(*) FROM levels_solution where levels_solution.LevelCode=levels.LevelCode and SolutionHistory='{$_POST['clh']}' ) as sol_adt
	
	from  levels
    
	where  levels.LevelID='{$_POST['com_level_id']}' ";
	// left join levels_solution on (levels.LevelCode=levels_solution.LevelCode)
	if ($result = $mysqli->query($query)) {
		$row = $result->fetch_array();
		if ((int)$row['sol_adt']==0) {
			$sql=" REPLACE INTO levels_solution(LevelCode,SolutionHistory,SolutionStep,UserId,IsCheck)
			 values('{$row['LevelCode']}','{$_POST['clh']}','".strlen($_POST['clh'])."','{$user_id}',1)
			";
			$mysqli->query($sql);
		}
	}
}


//bir sonraki - sıradaki level bilgilerini gönder
//TODO 
//$_POST['l']=48;
$level_sql_token= " and LevelNo>=1";
	
switch (@(int)$_POST['_l_mode']) {
	
	case 5:
	   if (@(int)$_POST['sel_level_id']>0)
		$level_sql_token=" and LevelID=".((int)$_POST['sel_level_id']);
	break;
  
  default:
    if (@(int)$_POST['l']>0)
		$level_sql_token=" and LevelNo>=".((int)$_POST['l']);
	
  

}	

	
	$query="Select * from (
select 
ROW_NUMBER() OVER (
		ORDER BY `LevelCategory`
	) as num,levels.*  from levels where LevelCategory='4' Order by `LevelID`
 ) son where son.num>=".( ((int)$_POST['l']))."  Order by son.num Limit 1";
	
	$query="select * from 
	levels where  1=1  {$level_sql_token} Order by LevelNo Limit 1";
	
	 
	$result = $mysqli->query($query) ;
	
	if ($result	&& $result->num_rows>0) {
		
		$row = $result->fetch_array();
		
		
		$sql_sol="select SolutionHistory from levels_solution 
		where LevelCode='{$row['LevelCode']}' Order by SolutionStep ASC Limit 1 ";
		
		$row_sol=['SolutionHistory'=>''];
		
		$result_sol = $mysqli->query($sql_sol);
		if ($result_sol && $result_sol->num_rows>0 ) {
			$row_sol = $result_sol->fetch_array();
		}		
			
			print json_encode(
			 array(
			 "id"=>$row['LevelID'],
			 "num"=>$row['LevelNo'],
			 "LevelMap"=>$row['LevelMap'],
			 'SolHist'=>$row_sol['SolutionHistory']
			 )
			);
	} else echo $query;
	
 

@mysqli_close($link);
//88 -40 kaldı
} else echo "l:".$_POST['l']; 
?>