/* eslint-disable @next/next/no-img-element */
import type {Subject} from "../data/platform";

export function OfficialPhoto({subject,compact=false,bare=false}:{subject:Subject;compact?:boolean;bare?:boolean}){
 const canShow=subject.photoUsageStatus==="cleared_for_reuse"&&Boolean(subject.officialPhotoUrl);
 return <figure className={`official-photo ${compact?"official-photo--compact":""} ${bare?"official-photo--bare":""}`}>{canShow?<img src={subject.officialPhotoUrl} alt={`${subject.name}の警察公式写真`} loading={compact?"lazy":"eager"} decoding="async"/>:<a className="official-photo-link" href={subject.photoSourceUrl} target="_blank" rel="noreferrer" aria-label={`${subject.name}の公式写真を警察サイトで確認`}><b>公式写真を見る ↗</b></a>}{!bare&&<figcaption><a href={subject.photoSourceUrl} target="_blank" rel="noreferrer">出典 {subject.photoSourceOrg} ↗</a><br/>公式掲載確認 {subject.photoCheckedAt}<br/>{subject.photoRightsNote}</figcaption>}</figure>
}
